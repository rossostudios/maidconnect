# Structured Outputs UI Integration Examples

This guide provides ready-to-use React component examples for integrating structured output features into the Casaora admin dashboard.

## Table of Contents

1. [Document Extraction UI](#document-extraction-ui)
2. [Review Analysis Integration](#review-analysis-integration)
3. [Professional Matching Interface](#professional-matching-interface)
4. [Analytics Report Display](#analytics-report-display)
5. [Amara Chat Integration](#amara-chat-integration)

---

## Document Extraction UI

### Admin Document Upload Component

```tsx
// src/components/admin/documents/DocumentUploadCard.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload01Icon, CheckmarkCircle02Icon, AlertCircleIcon } from 'hugeicons-react';
import type { DocumentExtraction } from '@/lib/integrations/amara/schemas';

interface DocumentUploadCardProps {
  professionalId: string;
  onExtractionComplete?: (data: DocumentExtraction) => void;
}

export function DocumentUploadCard({
  professionalId,
  onExtractionComplete,
}: DocumentUploadCardProps) {
  const [uploading, setUploading] = useState(false);
  const [extraction, setExtraction] = useState<DocumentExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Call extraction API
      const response = await fetch('/api/admin/documents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64,
          imageType: 'base64',
          documentType: 'national_id',
        }),
      });

      if (!response.ok) throw new Error('Extraction failed');

      const { extraction: result } = await response.json();
      setExtraction(result);
      onExtractionComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Upload ID Document
      </h3>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="document-upload"
          disabled={uploading}
        />
        <label htmlFor="document-upload" className="cursor-pointer">
          <Upload01Icon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-700 mb-2">
            {uploading ? 'Processing...' : 'Click to upload ID document'}
          </p>
          <p className="text-sm text-neutral-600">
            Supports: National ID, Passport, Driver's License
          </p>
        </label>
      </div>

      {/* Extraction Results */}
      {extraction && (
        <div className="mt-6 space-y-4">
          {/* Confidence Score */}
          <div className="flex items-center gap-2">
            {extraction.confidence >= 90 ? (
              <CheckmarkCircle02Icon className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircleIcon className="w-5 h-5 text-orange-600" />
            )}
            <span className="text-sm text-neutral-700">
              Confidence: {extraction.confidence}%
            </span>
          </div>

          {/* Extracted Data */}
          {extraction.personalInfo && (
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-neutral-900 mb-2">Extracted Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">Full Name:</span>
                  <p className="font-medium text-neutral-900">
                    {extraction.personalInfo.fullName || 'Not found'}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-600">ID Number:</span>
                  <p className="font-medium text-neutral-900">
                    {extraction.personalInfo.idNumber || 'Not found'}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-600">Date of Birth:</span>
                  <p className="font-medium text-neutral-900">
                    {extraction.personalInfo.dateOfBirth || 'Not found'}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-600">Nationality:</span>
                  <p className="font-medium text-neutral-900">
                    {extraction.personalInfo.nationality || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {extraction.warnings && extraction.warnings.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-600 mb-2">Warnings:</p>
              <ul className="text-sm text-orange-700 space-y-1">
                {extraction.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                // Auto-fill professional profile form
                console.log('Auto-filling profile with:', extraction.personalInfo);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Apply to Profile
            </Button>
            <Button variant="outline" onClick={() => setExtraction(null)}>
              Upload Another
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </Card>
  );
}

// Helper function
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      resolve(base64.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## Review Analysis Integration

### Review Moderation Queue Component

```tsx
// src/components/admin/reviews/ReviewModerationQueue.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckmarkCircle02Icon, Cancel01Icon, AlertCircleIcon } from 'hugeicons-react';
import type { ReviewAnalysis } from '@/lib/integrations/amara/schemas';

interface Review {
  id: string;
  text: string;
  rating: number;
  professionalName: string;
  customerName: string;
  createdAt: string;
}

export function ReviewModerationQueue() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, ReviewAnalysis>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    // Fetch pending reviews from API
    const response = await fetch('/api/admin/reviews?status=pending');
    const { reviews: data } = await response.json();
    setReviews(data);

    // Analyze each review
    for (const review of data) {
      analyzeReview(review);
    }

    setLoading(false);
  };

  const analyzeReview = async (review: Review) => {
    try {
      const response = await fetch('/api/admin/reviews/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: review.text,
          rating: review.rating,
          locale: 'en',
        }),
      });

      const { analysis } = await response.json();
      setAnalyses((prev) => new Map(prev).set(review.id, analysis));
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleApprove = async (reviewId: string) => {
    await fetch(`/api/admin/reviews/${reviewId}/approve`, { method: 'POST' });
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const handleReject = async (reviewId: string) => {
    await fetch(`/api/admin/reviews/${reviewId}/reject`, { method: 'POST' });
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  if (loading) {
    return <div className="text-neutral-600">Loading reviews...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-neutral-900">Review Moderation Queue</h2>

      {reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckmarkCircle02Icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <p className="text-neutral-600">All reviews have been moderated!</p>
        </Card>
      ) : (
        reviews.map((review) => {
          const analysis = analyses.get(review.id);
          const severity = analysis?.severity || 'low';

          return (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-neutral-900">
                      {review.customerName}
                    </span>
                    <span className="text-neutral-600">→</span>
                    <span className="text-neutral-700">{review.professionalName}</span>
                    <span className="text-orange-600 font-medium">
                      {review.rating}/5 ⭐
                    </span>
                  </div>

                  <p className="text-neutral-700 mb-4">{review.text}</p>

                  {/* AI Analysis */}
                  {analysis && (
                    <div className="space-y-2">
                      {/* Sentiment Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600">Sentiment:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            analysis.sentiment === 'positive'
                              ? 'bg-green-50 text-green-600'
                              : analysis.sentiment === 'negative'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {analysis.sentiment}
                        </span>
                      </div>

                      {/* Categories */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-neutral-600">Categories:</span>
                        {analysis.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-1 rounded-full text-xs bg-orange-50 text-orange-600"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Flags */}
                      {analysis.flags.length > 0 && analysis.flags[0] !== 'none' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircleIcon className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-600">
                              Safety Flags Detected
                            </span>
                          </div>
                          <ul className="text-sm text-red-700 space-y-1">
                            {analysis.flags.map((flag) => (
                              <li key={flag}>• {flag.replace(/_/g, ' ')}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* AI Suggested Response */}
                      {analysis.suggestedResponse && (
                        <div className="bg-neutral-50 rounded-lg p-3">
                          <p className="text-sm text-neutral-600 mb-1">
                            Suggested Response:
                          </p>
                          <p className="text-sm text-neutral-700">
                            {analysis.suggestedResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(review.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckmarkCircle02Icon className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(review.id)}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Cancel01Icon className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
```

---

## Professional Matching Interface

### Smart Search Component

```tsx
// src/components/professionals/SmartSearchBox.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search01Icon, Stars01Icon } from 'hugeicons-react';
import type { MatchingCriteria } from '@/lib/integrations/amara/schemas';

interface Professional {
  id: string;
  full_name: string;
  profile_picture_url?: string;
  average_rating: number;
  hourly_rate_cop: number;
  skills: string[];
  languages: string[];
  experience_years: number;
}

interface Match extends Professional {
  matchScore: number;
  matchBreakdown: {
    skills: number;
    languages: number;
    experience: number;
    rating: number;
    availability: number;
    price: number;
    special: number;
  };
}

export function SmartSearchBox() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [criteria, setCriteria] = useState<MatchingCriteria | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    try {
      const response = await fetch('/api/professionals/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, locale: 'en', limit: 10 }),
      });

      const { matches: results, criteria: parsedCriteria } = await response.json();
      setMatches(results);
      setCriteria(parsedCriteria);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="e.g., Need someone with 5+ years experience, speaks English, available weekends"
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={searching}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Search01Icon className="w-4 h-4 mr-2" />
          {searching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Detected Criteria */}
      {criteria && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <h3 className="text-sm font-semibold text-orange-600 mb-2">
            Detected Requirements:
          </h3>
          <div className="flex flex-wrap gap-2">
            {criteria.skills && criteria.skills.length > 0 && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-neutral-700">
                Skills: {criteria.skills.join(', ')}
              </span>
            )}
            {criteria.languages && criteria.languages.length > 0 && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-neutral-700">
                Languages: {criteria.languages.join(', ')}
              </span>
            )}
            {criteria.experienceYears !== undefined && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-neutral-700">
                {criteria.experienceYears}+ years experience
              </span>
            )}
            {criteria.availability && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-neutral-700">
                Availability: {Object.keys(criteria.availability).join(', ')}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Search Results */}
      <div className="space-y-3">
        {matches.length > 0 && (
          <h3 className="text-lg font-semibold text-neutral-900">
            Top {matches.length} Matches
          </h3>
        )}

        {matches.map((match) => (
          <Card key={match.id} className="p-6 hover:border-orange-500 transition-colors">
            <div className="flex items-start gap-4">
              {/* Profile Picture */}
              <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden flex-shrink-0">
                {match.profile_picture_url ? (
                  <img
                    src={match.profile_picture_url}
                    alt={match.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xl">
                    {match.full_name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                {/* Name & Match Score */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-neutral-900">
                    {match.full_name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Stars01Icon className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-600">
                      {match.matchScore}%
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                  <span>⭐ {match.average_rating.toFixed(1)}/5</span>
                  <span>💼 {match.experience_years} years</span>
                  <span>💰 ${(match.hourly_rate_cop / 1000).toFixed(0)}k COP/hr</span>
                </div>

                {/* Skills & Languages */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {match.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-neutral-100 rounded text-xs text-neutral-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {match.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-1 bg-orange-50 rounded text-xs text-orange-600"
                    >
                      {lang}
                    </span>
                  ))}
                </div>

                {/* Match Breakdown */}
                <details className="text-sm">
                  <summary className="text-orange-600 cursor-pointer hover:underline">
                    View match breakdown
                  </summary>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-600">Skills:</span>
                      <span className="ml-1 font-medium">
                        {Math.round(match.matchBreakdown.skills)}/30
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600">Languages:</span>
                      <span className="ml-1 font-medium">
                        {Math.round(match.matchBreakdown.languages)}/20
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600">Experience:</span>
                      <span className="ml-1 font-medium">
                        {Math.round(match.matchBreakdown.experience)}/15
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-600">Rating:</span>
                      <span className="ml-1 font-medium">
                        {Math.round(match.matchBreakdown.rating)}/15
                      </span>
                    </div>
                  </div>
                </details>

                {/* Action Button */}
                <Button
                  size="sm"
                  className="mt-3 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => {
                    window.location.href = `/professionals/${match.id}`;
                  }}
                >
                  View Profile
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {matches.length === 0 && query && !searching && (
          <Card className="p-8 text-center">
            <p className="text-neutral-600">
              No matches found. Try adjusting your search criteria.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
```

---

## Analytics Report Display

### Weekly Report Dashboard

```tsx
// src/components/admin/analytics/WeeklyReportCard.tsx

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartLineIcon, Download01Icon, AlertCircleIcon } from 'hugeicons-react';
import type { AdminAnalytics } from '@/lib/integrations/amara/schemas';

export function WeeklyReportCard() {
  const [report, setReport] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Get last 7 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const response = await fetch('/api/admin/analytics/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, format: 'json' }),
      });

      const { report: data } = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdown = async () => {
    if (!report) return;

    const response = await fetch('/api/admin/analytics/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: report.reportPeriod.startDate,
        endDate: report.reportPeriod.endDate,
        format: 'markdown',
      }),
    });

    const markdown = await response.text();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casaora-report-${report.reportPeriod.startDate}.md`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Weekly Analytics Report</h2>
        <div className="flex gap-3">
          <Button
            onClick={generateReport}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ChartLineIcon className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
          {report && (
            <Button variant="outline" onClick={downloadMarkdown}>
              <Download01Icon className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      {report && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-6">
              <p className="text-sm text-neutral-600 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-neutral-900">
                {report.metrics.bookings.total}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {report.metrics.bookings.completed} completed
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-neutral-600 mb-1">Revenue</p>
              <p className="text-3xl font-bold text-neutral-900">
                ${(report.metrics.revenue.totalCop / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {report.metrics.revenue.growthPercentage > 0 ? '+' : ''}
                {report.metrics.revenue.growthPercentage}% growth
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-neutral-600 mb-1">Avg Rating</p>
              <p className="text-3xl font-bold text-neutral-900">
                {report.metrics.professionals.averageRating.toFixed(1)}
              </p>
              <p className="text-sm text-neutral-600 mt-1">⭐ out of 5.0</p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-neutral-600 mb-1">Active Pros</p>
              <p className="text-3xl font-bold text-neutral-900">
                {report.metrics.professionals.active}
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                +{report.metrics.professionals.newSignups} new
              </p>
            </Card>
          </div>

          {/* Critical Alerts */}
          {report.alerts && report.alerts.length > 0 && (
            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <AlertCircleIcon className="w-5 h-5" />
                Critical Alerts
              </h3>
              <div className="space-y-3">
                {report.alerts.map((alert, i) => (
                  <div key={i} className="bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-red-600 mb-1">
                          {alert.severity.toUpperCase()}: {alert.message}
                        </p>
                        <p className="text-sm text-neutral-700 mb-2">
                          Affected: {alert.affectedArea}
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          Suggested Action: {alert.suggestedAction}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* AI Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              AI-Powered Insights
            </h3>
            <div className="space-y-4">
              {report.insights.map((insight, i) => (
                <div
                  key={i}
                  className={`border-l-4 pl-4 py-2 ${
                    insight.priority === 'critical'
                      ? 'border-red-500'
                      : insight.priority === 'high'
                        ? 'border-orange-500'
                        : insight.priority === 'medium'
                          ? 'border-yellow-500'
                          : 'border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        insight.priority === 'critical'
                          ? 'bg-red-50 text-red-600'
                          : insight.priority === 'high'
                            ? 'bg-orange-50 text-orange-600'
                            : insight.priority === 'medium'
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {insight.priority}
                    </span>
                    <span className="text-sm text-neutral-600">{insight.category}</span>
                  </div>
                  <p className="text-neutral-900 mb-1">{insight.observation}</p>
                  <p className="text-sm text-neutral-700 mb-2">
                    💡 <strong>Recommendation:</strong> {insight.recommendation}
                  </p>
                  {insight.expectedImpact && (
                    <p className="text-sm text-orange-600">
                      📈 Expected Impact: {insight.expectedImpact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Trends */}
          {report.trends && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Trends</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Booking Trend</p>
                  <p
                    className={`text-lg font-medium ${
                      report.trends.bookings.direction === 'up'
                        ? 'text-green-600'
                        : report.trends.bookings.direction === 'down'
                          ? 'text-red-600'
                          : 'text-neutral-600'
                    }`}
                  >
                    {report.trends.bookings.direction === 'up' ? '↑' : ''}
                    {report.trends.bookings.direction === 'down' ? '↓' : ''}
                    {report.trends.bookings.direction === 'stable' ? '→' : ''}
                    {report.trends.bookings.percentageChange > 0 ? '+' : ''}
                    {report.trends.bookings.percentageChange}%
                  </p>
                </div>

                <div>
                  <p className="text-sm text-neutral-600 mb-1">Revenue Trend</p>
                  <p
                    className={`text-lg font-medium ${
                      report.trends.revenue.direction === 'up'
                        ? 'text-green-600'
                        : report.trends.revenue.direction === 'down'
                          ? 'text-red-600'
                          : 'text-neutral-600'
                    }`}
                  >
                    {report.trends.revenue.direction === 'up' ? '↑' : ''}
                    {report.trends.revenue.direction === 'down' ? '↓' : ''}
                    {report.trends.revenue.direction === 'stable' ? '→' : ''}
                    {report.trends.revenue.percentageChange > 0 ? '+' : ''}
                    {report.trends.revenue.percentageChange}%
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {!report && !loading && (
        <Card className="p-12 text-center">
          <ChartLineIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600">
            Click "Generate Report" to see AI-powered analytics insights
          </p>
        </Card>
      )}
    </div>
  );
}
```

---

## Amara Chat Integration

### Booking Intent Parser for Amara

```tsx
// src/components/amara/AmaraChatWithIntent.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { parseBookingIntent } from '@/lib/services/amara/booking-intent-service';
import type { BookingIntent } from '@/lib/integrations/amara/schemas';

export function AmaraChatWithIntent() {
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);
  const [input, setInput] = useState('');
  const [detectedIntent, setDetectedIntent] = useState<BookingIntent | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Parse booking intent from user message
      const intent = await parseBookingIntent(userMessage, 'en');
      setDetectedIntent(intent);

      // Generate response based on intent
      const response = generateIntentResponse(intent);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I had trouble understanding that. Could you rephrase your request?',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateIntentResponse = (intent: BookingIntent): string => {
    const parts: string[] = [];

    if (intent.serviceType) {
      parts.push(`I understand you need ${intent.serviceType} services.`);
    }

    if (intent.location?.city) {
      parts.push(`Looking for professionals in ${intent.location.city}.`);
    }

    if (intent.requirements?.languages) {
      parts.push(`Who speak ${intent.requirements.languages.join(' and ')}.`);
    }

    if (intent.schedule?.date) {
      parts.push(`For ${intent.schedule.date}.`);
    }

    if (intent.urgency === 'immediate') {
      parts.push('I'll prioritize urgent availability!');
    }

    parts.push('Let me find the perfect match for you...');

    return parts.join(' ');
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-100 text-neutral-900'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detected Intent Display */}
      {detectedIntent && (
        <Card className="mx-4 mb-4 p-3 bg-orange-50 border-orange-200">
          <p className="text-xs font-semibold text-orange-600 mb-1">Detected Intent:</p>
          <div className="flex flex-wrap gap-2">
            {detectedIntent.serviceType && (
              <span className="px-2 py-1 bg-white rounded text-xs">
                {detectedIntent.serviceType}
              </span>
            )}
            {detectedIntent.location?.city && (
              <span className="px-2 py-1 bg-white rounded text-xs">
                📍 {detectedIntent.location.city}
              </span>
            )}
            {detectedIntent.requirements?.languages &&
              detectedIntent.requirements.languages.length > 0 && (
                <span className="px-2 py-1 bg-white rounded text-xs">
                  🗣️ {detectedIntent.requirements.languages.join(', ')}
                </span>
              )}
            {detectedIntent.urgency && (
              <span className="px-2 py-1 bg-white rounded text-xs">
                ⏰ {detectedIntent.urgency}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Input Area */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="e.g., I need a cleaner tomorrow in Bogotá..."
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. Error Handling

Always wrap API calls in try/catch blocks and show user-friendly error messages:

```tsx
try {
  const response = await fetch('/api/admin/reviews/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const result = await response.json();
  // Handle success
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly error
  setError('Something went wrong. Please try again.');
}
```

### 2. Loading States

Provide clear feedback during async operations:

```tsx
{
  loading ? (
    <div className="flex items-center gap-2 text-neutral-600">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent" />
      Processing...
    </div>
  ) : (
    <Button>Submit</Button>
  );
}
```

### 3. Accessibility

Ensure all interactive elements have proper ARIA labels:

```tsx
<button
  aria-label="Approve review"
  onClick={handleApprove}
  className="..."
>
  <CheckmarkCircle02Icon />
</button>
```

### 4. Responsive Design

Use Tailwind's responsive utilities for mobile-first design:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

---

## Next Steps

1. Copy these components into your project
2. Adjust styling to match your design system
3. Connect to your actual API endpoints
4. Test thoroughly on different devices
5. Set up PostHog feature flags for gradual rollout

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0
**Maintainer:** Casaora Engineering Team
