import { Loader } from '@mantine/core';

import { useOverview } from '../../apis/queries/admin.queries';
import BarList from '../../components/dashboard/BarList';
import KpiCard from '../../components/dashboard/KpiCard';
import TrendChart from '../../components/dashboard/TrendChart';

const Overview = () => {
  const { data, isLoading } = useOverview();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader color="primary" />
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-8">
      <div>
        <p className="vc-wordmark text-xs text-gold-700">Dashboard</p>
        <h1 className="mt-2 font-serif text-3xl text-primary-900 sm:text-4xl">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">
          A snapshot of how Vastriq Closet is doing today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Users" value={kpis?.users ?? 0} icon="tabler:users" />
        <KpiCard label="Active listings" value={kpis?.activeOutfits ?? 0} icon="tabler:hanger" />
        <KpiCard label="Pending moderation" value={kpis?.pendingOutfits ?? 0} icon="tabler:clock" />
        <KpiCard label="Enquiries" value={kpis?.totalEnquiries ?? 0} icon="tabler:message-2" />
        <KpiCard label="Open reports" value={kpis?.openReports ?? 0} icon="tabler:flag" />
        <KpiCard label="New users (30d)" value={kpis?.newUsers30d ?? 0} icon="tabler:user-plus" />
      </div>

      <TrendChart
        title="New signups"
        subtitle="Last 30 days"
        data={(data?.signupsSeries ?? []).map((s) => ({ date: s.date, value: s.signups }))}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <BarList
          title="Top categories"
          subtitle="By active listing count"
          items={data?.topCategories ?? []}
        />
      </div>
    </div>
  );
};

export default Overview;
