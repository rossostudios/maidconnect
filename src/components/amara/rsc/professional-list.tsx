/**
 * Professional List (RSC Component)
 *
 * Server Component that displays a list of professional cards with metadata.
 * Rendered inline in Amara chat stream.
 */

import { ProfessionalCard, type Professional } from './professional-card';

type ProfessionalListProps = {
  professionals: Professional[];
  totalFound?: number;
  searchParams?: {
    serviceType?: string;
    city?: string;
    maxBudgetCop?: number;
    minRating?: number;
  };
};

/**
 * Empty state component
 */
function EmptyState({ searchParams }: { searchParams?: ProfessionalListProps['searchParams'] }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-8 text-center">
      <svg
        className="mx-auto h-12 w-12 text-neutral-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-neutral-900">No professionals found</h3>
      <p className="mt-2 text-sm text-neutral-600">
        {searchParams?.city || searchParams?.serviceType
          ? 'Try adjusting your search criteria or location.'
          : 'Try searching for professionals in your area.'}
      </p>
    </div>
  );
}

/**
 * Professional List Component (Server Component)
 */
export function ProfessionalList({
  professionals,
  totalFound,
  searchParams,
}: ProfessionalListProps) {
  // Empty state
  if (professionals.length === 0) {
    return <EmptyState searchParams={searchParams} />;
  }

  return (
    <div className="space-y-3">
      {/* Header with count */}
      {totalFound !== undefined && totalFound > professionals.length && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-700">
            Showing top {professionals.length} of {totalFound} professionals
            {searchParams?.city && ` in ${searchParams.city}`}
          </p>
        </div>
      )}

      {/* Professional cards */}
      <div className="space-y-4">
        {professionals.map((professional) => (
          <ProfessionalCard key={professional.id} professional={professional} />
        ))}
      </div>

      {/* Footer tip */}
      {professionals.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-sm text-neutral-700">
            💡 <span className="font-medium">Tip:</span> Click "Book Now" to check availability and
            schedule a service.
          </p>
        </div>
      )}
    </div>
  );
}
