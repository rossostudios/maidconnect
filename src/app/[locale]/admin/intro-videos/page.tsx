"use client";

import { Cancel01Icon, Tick02Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/routing";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { formatDate } from "@/lib/utils/format";

interface IntroVideoReviewData {
  id: string;
  professional_id: string;
  full_name: string;
  country_code: string;
  primary_services: string[];
  intro_video_path: string;
  intro_video_status: string;
  intro_video_duration_seconds: number;
  intro_video_uploaded_at: string;
}

export default function AdminIntroVideosPage() {
  const [videoData, setVideoData] = useState<IntroVideoReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      const supabase = createSupabaseBrowserClient();

      // Fetch all intro videos (pending, approved, rejected)
      const { data: videos, error } = await supabase
        .from("professional_profiles")
        .select(
          "id, profile_id, full_name, country_code, primary_services, intro_video_path, intro_video_status, intro_video_duration_seconds, intro_video_uploaded_at"
        )
        .not("intro_video_path", "is", null)
        .order("intro_video_uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching intro videos:", error);
      }

      setVideoData((videos || []) as unknown as IntroVideoReviewData[]);
      setIsLoading(false);
    }

    fetchVideos();
  }, []);

  // Group by status
  const pendingVideos = videoData.filter((v) => v.intro_video_status === "pending_review");
  const approvedVideos = videoData.filter((v) => v.intro_video_status === "approved");
  const rejectedVideos = videoData.filter((v) => v.intro_video_status === "rejected");

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-orange-500" />
          <p className="text-neutral-500 text-sm">Loading intro videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-semibold text-3xl text-neutral-900">Intro Video Reviews</h1>
        <p className="mt-2 text-base text-neutral-700 leading-relaxed">
          Review professional intro videos for approval. Videos are shown on professional profiles
          to help customers make booking decisions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Pending Review</p>
              <p className="mt-2 font-semibold text-3xl text-neutral-900">{pendingVideos.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-orange-200 bg-orange-50">
              <Icon className="h-6 w-6 text-orange-600" icon={Video01Icon} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Approved</p>
              <p className="mt-2 font-semibold text-3xl text-neutral-900">
                {approvedVideos.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-green-200 bg-green-50">
              <Icon className="h-6 w-6 text-green-600" icon={Tick02Icon} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-600 text-sm">Rejected</p>
              <p className="mt-2 font-semibold text-3xl text-neutral-900">
                {rejectedVideos.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-red-200 bg-red-50">
              <Icon className="h-6 w-6 text-red-600" icon={Cancel01Icon} />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Videos Section */}
      {pendingVideos.length > 0 && (
        <div>
          <h2 className="mb-4 font-semibold text-neutral-900 text-xl">
            Pending Review ({pendingVideos.length})
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-neutral-200 border-b bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Professional
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Market
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {pendingVideos.map((video) => (
                    <tr className="hover:bg-neutral-50" key={video.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                            <Icon className="h-5 w-5 text-neutral-600" icon={Video01Icon} />
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900 text-sm">
                              {video.full_name}
                            </div>
                            <div className="text-neutral-500 text-xs">ID: {video.profile_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant="default">{video.country_code}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {video.primary_services?.slice(0, 2).join(", ") || "N/A"}
                          {video.primary_services?.length > 2 && (
                            <span className="text-neutral-500">
                              {" "}
                              +{video.primary_services.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-neutral-700 text-sm">
                        {video.intro_video_duration_seconds}s
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-neutral-700 text-sm">
                        {formatDate(new Date(video.intro_video_uploaded_at), "short")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/intro-videos/${video.profile_id}`}>
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Approved Videos Section */}
      {approvedVideos.length > 0 && (
        <div>
          <h2 className="mb-4 font-semibold text-neutral-900 text-xl">
            Approved ({approvedVideos.length})
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-neutral-200 border-b bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Professional
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Market
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {approvedVideos.map((video) => (
                    <tr className="hover:bg-neutral-50" key={video.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-neutral-900 text-sm">
                          {video.full_name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant="default">{video.country_code}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant="success">
                          <Icon className="mr-1 h-3 w-3" icon={Tick02Icon} />
                          Approved
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link href={`/admin/intro-videos/${video.profile_id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Rejected Videos Section */}
      {rejectedVideos.length > 0 && (
        <div>
          <h2 className="mb-4 font-semibold text-neutral-900 text-xl">
            Rejected ({rejectedVideos.length})
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-neutral-200 border-b bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Professional
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Market
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-neutral-700 text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {rejectedVideos.map((video) => (
                    <tr className="hover:bg-neutral-50" key={video.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-neutral-900 text-sm">
                          {video.full_name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant="default">{video.country_code}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant="destructive">
                          <Icon className="mr-1 h-3 w-3" icon={Cancel01Icon} />
                          Rejected
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link href={`/admin/intro-videos/${video.profile_id}`}>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {videoData.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
              <Icon className="h-8 w-8 text-neutral-400" icon={Video01Icon} />
            </div>
            <h3 className="mt-4 font-semibold text-lg text-neutral-900">No intro videos yet</h3>
            <p className="mt-2 text-neutral-600 text-sm">
              Professionals haven't uploaded any intro videos to review.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
