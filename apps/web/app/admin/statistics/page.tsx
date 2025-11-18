import { requireAdmin } from '@bloomwell/auth/lib/admin-check';
import prisma from '@bloomwell/db';
import { format, subDays } from 'date-fns';

export default async function AdminStatisticsPage() {
  // Server-side admin check
  await requireAdmin();

  // Get date range for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date,
      label: format(date, 'MMM d'),
      startOfDay: new Date(date.setHours(0, 0, 0, 0)),
      endOfDay: new Date(date.setHours(23, 59, 59, 999)),
    };
  });

  // Get registration counts for last 7 days
  const registrationStats = await Promise.all(
    last7Days.map(async ({ date, startOfDay, endOfDay }) => {
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
      return { date: format(date, 'MMM d'), count };
    })
  );

  // Get OAuth vs Credentials breakdown
  const [oauthUsers, credentialsUsers] = await Promise.all([
    prisma.user.count({
      where: {
        hashedPassword: null, // OAuth users don't have passwords
      },
    }),
    prisma.user.count({
      where: {
        hashedPassword: { not: null }, // Credentials users have passwords
      },
    }),
  ]);

  // Get verification statistics
  const [
    totalCodes,
    usedCodes,
    expiredCodes,
    verificationSuccessRate,
  ] = await Promise.all([
    prisma.verificationCode.count(),
    prisma.verificationCode.count({ where: { used: true } }),
    prisma.verificationCode.count({
      where: {
        expires: { lt: new Date() },
        used: false,
      },
    }),
    prisma.verificationCode.count({ where: { used: true } }),
  ]);

  const totalUsers = await prisma.user.count();
  const verifiedUsers = await prisma.user.count({
    where: { emailVerified: { not: null } },
  });

  const successRate =
    totalCodes > 0 ? Math.round((usedCodes / totalCodes) * 100) : 0;
  const verificationRate =
    totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

  const maxRegistrations = Math.max(...registrationStats.map((s) => s.count), 1);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Statistics & Analytics</h2>
        <p className="text-gray-600 mt-1">
          Detailed insights into user registrations and verification trends
        </p>
      </div>

      {/* Registration Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          User Registrations (Last 7 Days)
        </h3>
        <div className="space-y-4">
          {registrationStats.map((stat) => (
            <div key={stat.date} className="flex items-center gap-4">
              <div className="w-20 text-sm text-gray-600 font-medium">
                {stat.date}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-brand h-8 rounded transition-all"
                    style={{
                      width: `${(stat.count / maxRegistrations) * 100}%`,
                      minWidth: stat.count > 0 ? '2rem' : '0',
                    }}
                  >
                    <span className="px-2 py-1 text-white text-sm font-medium">
                      {stat.count > 0 ? stat.count : ''}
                    </span>
                  </div>
                  {stat.count === 0 && (
                    <span className="text-sm text-gray-400">No registrations</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Authentication Methods
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  OAuth (Google/Microsoft)
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {oauthUsers} users
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${totalUsers > 0 ? (oauthUsers / totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {totalUsers > 0
                  ? Math.round((oauthUsers / totalUsers) * 100)
                  : 0}
                % of total users
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Email & Password
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {credentialsUsers} users
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${totalUsers > 0 ? (credentialsUsers / totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {totalUsers > 0
                  ? Math.round((credentialsUsers / totalUsers) * 100)
                  : 0}
                % of total users
              </p>
            </div>
          </div>
        </div>

        {/* Verification Statistics */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Email Verification Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Total Codes Sent
              </span>
              <span className="text-lg font-bold text-gray-900">{totalCodes}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">
                Successfully Used
              </span>
              <span className="text-lg font-bold text-green-700">{usedCodes}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Expired</span>
              <span className="text-lg font-bold text-red-700">{expiredCodes}</span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Verification Success Rate
                </span>
                <span className="text-2xl font-bold text-brand">{successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className="bg-brand h-3 rounded-full transition-all"
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Overall User Verification Rate
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {verificationRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${verificationRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {verifiedUsers} of {totalUsers} users verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{totalUsers}</p>
          <p className="text-sm opacity-75 mt-2">All registered accounts</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Verified Users</h3>
          <p className="text-4xl font-bold">{verifiedUsers}</p>
          <p className="text-sm opacity-75 mt-2">Email verified accounts</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Verification Codes</h3>
          <p className="text-4xl font-bold">{totalCodes}</p>
          <p className="text-sm opacity-75 mt-2">Total codes generated</p>
        </div>
      </div>
    </div>
  );
}
