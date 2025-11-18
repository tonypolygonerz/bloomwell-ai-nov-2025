'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@bloomwell/ui';
import { Card } from '@bloomwell/ui';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let title = 'Authentication Error';
  let description = 'An error occurred during authentication.';
  let showVerificationHelper = false;

  switch (error) {
    case 'OAuthAccountNotLinked':
      title = 'Account Not Linked';
      description = 'This email is associated with a different login method.';
      break;
    case 'OAuthCallback':
      title = 'OAuth Error';
      description = 'An error occurred with the OAuth provider.';
      break;
    case 'AccessDenied':
      title = 'Email Verification Required';
      description = 'Your email needs to be verified before you can sign in.';
      showVerificationHelper = true;
      break;
    case 'CredentialsSignin':
      title = 'Sign In Failed';
      description = 'Invalid email or password, or your email is not verified.';
      showVerificationHelper = true;
      break;
    default:
      title = 'Sign In Failed';
      description = 'Unable to sign in. Please try again.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 text-red-500 mb-4 flex items-center justify-center">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="space-y-4">
          {showVerificationHelper && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    If you haven't verified your email yet, please check your inbox for a verification code.
                    You can also request a new verification code by registering again.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full">
                Try Signing In Again
              </Button>
            </Link>
            
            {showVerificationHelper && (
              <Link href="/register" className="block">
                <button className="w-full px-4 py-2 rounded-md border border-[#1E6F5C] text-[#1E6F5C] transition-colors hover:bg-[#1E6F5C] hover:text-white">
                  Get New Verification Code
                </button>
              </Link>
            )}
            
            <Link href="/" className="block">
              <button className="w-full px-4 py-2 rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50">
                Return to Home
              </button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

