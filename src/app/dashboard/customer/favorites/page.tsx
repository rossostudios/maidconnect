import { requireUser } from "@/lib/auth";
import { FavoritesList } from "@/components/favorites/favorites-list";

export default async function CustomerFavoritesPage() {
  await requireUser({ allowedRoles: ["customer"] });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#211f1a]">My Favorites</h1>
        <p className="mt-2 text-base leading-relaxed text-[#5d574b]">
          Quick access to your favorite professionals for easy rebooking.
        </p>
      </div>

      <div className="rounded-[28px] bg-white p-8 shadow-[0_20px_60px_-15px_rgba(18,17,15,0.15)] backdrop-blur-sm">
        <FavoritesList />
      </div>
    </section>
  );
}
