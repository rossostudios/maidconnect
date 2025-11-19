/**
 * Professional Slug Management API
 * GET /api/pro/slug - Get current slug
 * PUT /api/pro/slug - Update slug
 * POST /api/pro/slug/check - Check slug availability
 *
 * Allows professionals to manage their vanity URL slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { logger } from '@/lib/logger';
import { generateUniqueSlug, isValidSlug, sanitizeSlugInput } from '@/lib/utils/slug';

// ========================================
// Validation Schemas
// ========================================

const UpdateSlugSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(60, 'Slug must be at most 60 characters')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

const CheckSlugSchema = z.object({
  slug: z.string().min(3).max(60),
});

// ========================================
// GET: Get Current Slug
// ========================================

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'professional') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    const { data: profile, error } = await supabase
      .from('professional_profiles')
      .select('slug, full_name, profile_visibility')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (error || !profile) {
      return NextResponse.json({ error: 'Professional profile not found' }, { status: 404 });
    }

    // Generate suggested slug if none exists
    let suggestedSlug = profile.slug;
    if (!suggestedSlug && profile.full_name) {
      suggestedSlug = generateUniqueSlug(profile.full_name, user.id);
    }

    return NextResponse.json({
      success: true,
      currentSlug: profile.slug,
      suggestedSlug,
      profileVisibility: profile.profile_visibility || 'private',
      vanityUrl: profile.slug
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/pro/${profile.slug}`
        : null,
    });
  } catch (error) {
    logger.error('[Slug API] Failed to get slug', {
      professionalId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to fetch slug information' },
      { status: 500 }
    );
  }
}

// ========================================
// PUT: Update Slug
// ========================================

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'professional') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    // ========================================
    // 1. Parse and Validate Request
    // ========================================

    const body = await request.json();
    const validation = UpdateSlugSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid slug format',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { slug } = validation.data;

    // Sanitize slug input (extra safety layer)
    const sanitizedSlug = sanitizeSlugInput(slug);
    if (!isValidSlug(sanitizedSlug)) {
      return NextResponse.json(
        { error: 'Invalid slug format after sanitization' },
        { status: 400 }
      );
    }

    // ========================================
    // 2. Check if Slug is Already Taken
    // ========================================

    const { data: existingProfile } = await supabase
      .from('professional_profiles')
      .select('profile_id')
      .eq('slug', sanitizedSlug)
      .maybeSingle();

    if (existingProfile && existingProfile.profile_id !== user.id) {
      return NextResponse.json(
        { error: 'This slug is already taken. Please choose a different one.' },
        { status: 409 }
      );
    }

    // ========================================
    // 3. Update Slug
    // ========================================

    const { data: updatedProfile, error: updateError } = await supabase
      .from('professional_profiles')
      .update({
        slug: sanitizedSlug,
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', user.id)
      .select('slug, profile_visibility')
      .single();

    if (updateError || !updatedProfile) {
      logger.error('[Slug API] Failed to update slug', {
        professionalId: user.id,
        slug: sanitizedSlug,
        error: updateError,
      });

      return NextResponse.json(
        { error: 'Failed to update slug' },
        { status: 500 }
      );
    }

    logger.info('[Slug API] Slug updated successfully', {
      professionalId: user.id,
      newSlug: sanitizedSlug,
    });

    // ========================================
    // 4. Return Success Response
    // ========================================

    return NextResponse.json({
      success: true,
      slug: updatedProfile.slug,
      vanityUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pro/${updatedProfile.slug}`,
      profileVisibility: updatedProfile.profile_visibility,
    });
  } catch (error) {
    logger.error('[Slug API] Failed to update slug', {
      professionalId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: 'Failed to update slug' },
      { status: 500 }
    );
  }
}

// ========================================
// POST: Check Slug Availability
// ========================================

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== 'professional') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    // ========================================
    // 1. Parse and Validate Request
    // ========================================

    const body = await request.json();
    const validation = CheckSlugSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          available: false,
          error: 'Invalid slug format',
        },
        { status: 200 }
      );
    }

    const { slug } = validation.data;

    // Sanitize and validate
    const sanitizedSlug = sanitizeSlugInput(slug);
    if (!isValidSlug(sanitizedSlug)) {
      return NextResponse.json({
        available: false,
        error: 'Invalid slug format',
      });
    }

    // ========================================
    // 2. Check Availability
    // ========================================

    const { data: existingProfile } = await supabase
      .from('professional_profiles')
      .select('profile_id')
      .eq('slug', sanitizedSlug)
      .maybeSingle();

    const isOwnSlug = existingProfile?.profile_id === user.id;
    const isAvailable = !existingProfile || isOwnSlug;

    return NextResponse.json({
      available: isAvailable,
      slug: sanitizedSlug,
      isOwnSlug,
    });
  } catch (error) {
    logger.error('[Slug API] Failed to check slug availability', {
      professionalId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}

// ========================================
// Runtime Configuration
// ========================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
