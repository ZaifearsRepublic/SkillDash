'use client'

import { useEffect, useRef, useCallback } from 'react'
import Script from 'next/script'
import { signInWithGoogleOneTapCredential } from '../lib/firebase'

declare global {
  interface Window {
    google?: any
  }
}

interface GoogleOneTapProps {
  clientId: string
  // When true, One Tap will not initialize/prompt at all (e.g. user already
  // signed in, in-app browser, insecure context, or a redirect OAuth flow
  // is already in flight).
  disabled?: boolean
  onError?: (err: any) => void
  onSigningIn?: (signingIn: boolean) => void
}

/**
 * Google Identity Services "One Tap" — a lightweight, best-effort layer on
 * top of the existing Google button flow (SocialAuth.tsx / signInWithPopup).
 * It never renders its own visible button: if the floating One Tap card
 * doesn't show (cooldown, no Google session, browser doesn't support it),
 * the existing "Continue with Google" button remains the guaranteed path.
 */
export default function GoogleOneTap({ clientId, disabled, onError, onSigningIn }: GoogleOneTapProps) {
  const initializedRef = useRef(false)
  const inFlightRef = useRef(false)

  const handleCredentialResponse = useCallback(async (response: { credential?: string }) => {
    if (!response?.credential || inFlightRef.current) return
    inFlightRef.current = true
    onSigningIn?.(true)
    try {
      await signInWithGoogleOneTapCredential(response.credential)
      // Firebase's onAuthStateChanged (in AuthContext) takes it from here —
      // welcome bonus, user-doc creation, and the /auth page's own
      // redirect-after-login logic all run exactly as they do for the
      // popup/redirect flow.
    } catch (err: any) {
      console.warn('Google One Tap sign-in failed:', err?.code || err?.message || err)
      onError?.(err)
    } finally {
      inFlightRef.current = false
      onSigningIn?.(false)
    }
  }, [onError, onSigningIn])

  const initializeOneTap = useCallback(() => {
    if (initializedRef.current || disabled) return
    if (typeof window === 'undefined') return

    if (!clientId) {
      // A silent no-op here would be very hard to self-diagnose, so log a
      // clear, actionable message instead of just returning.
      console.warn(
        '[GoogleOneTap] Skipped: NEXT_PUBLIC_GOOGLE_CLIENT_ID is empty. ' +
        'This is inlined at build time — if you just added it to .env.local, ' +
        'restart `next dev`. If this is a deployed (Vercel) build, .env.local ' +
        'has NO effect there: add the same key in Project Settings → ' +
        'Environment Variables in the Vercel dashboard and redeploy.'
      )
      return
    }

    if (!window.google?.accounts?.id) {
      console.warn('[GoogleOneTap] Skipped: window.google.accounts.id is not available yet (GSI script not loaded).')
      return
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        // Require an explicit tap even for a recognized returning user —
        // avoids silently signing someone into a shared/public device.
        auto_select: false,
        cancel_on_tap_outside: true,
        // Required for current Chrome (legacy non-FedCM prompt is deprecated).
        use_fedcm_for_prompt: true,
        itp_support: true,
      })
      initializedRef.current = true

      // Best-effort floating "Sign in with Google" card. Under FedCM the
      // failure/skip reason is sometimes opaque by design, but browsers
      // often still report one — log it so a silent no-show is debuggable
      // instead of a mystery.
      window.google.accounts.id.prompt((notification: any) => {
        try {
          if (notification?.isNotDisplayed?.()) {
            console.warn(
              `[GoogleOneTap] Not displayed. Reason: ${notification.getNotDisplayedReason?.()}. ` +
              'Common causes: origin missing from Google Cloud Console → Credentials → ' +
              'Authorized JavaScript origins; no active Google session in this browser; ' +
              'FedCM disabled/blocked; or Google\'s cooldown after recent dismissals.'
            )
          } else if (notification?.isSkippedMoment?.()) {
            console.warn(`[GoogleOneTap] Skipped. Reason: ${notification.getSkippedReason?.()}.`)
          } else if (notification?.isDismissedMoment?.()) {
            console.info(`[GoogleOneTap] Dismissed. Reason: ${notification.getDismissedReason?.()}.`)
          } else {
            console.info(`[GoogleOneTap] Prompt moment: ${notification?.getMomentType?.() || 'displayed'}.`)
          }
        } catch (notifyErr) {
          console.warn('[GoogleOneTap] Could not read prompt moment notification:', notifyErr)
        }
      })
    } catch (err) {
      console.warn('[GoogleOneTap] Initialization failed:', err)
    }
  }, [clientId, disabled, handleCredentialResponse])

  useEffect(() => {
    if (disabled) return
    initializeOneTap()

    return () => {
      // Dismiss any visible prompt on unmount so it doesn't linger across
      // route changes (e.g. user navigates away right as it appears).
      try {
        window.google?.accounts?.id?.cancel()
      } catch {
        // no-op
      }
    }
  }, [disabled, initializeOneTap])

  if (disabled || !clientId) return null

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={initializeOneTap}
    />
  )
}