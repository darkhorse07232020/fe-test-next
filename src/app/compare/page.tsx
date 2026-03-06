import CompareLaunchesPage from "@/components/CompareLaunchesPage";

interface CompareRouteProps {
  searchParams: Promise<{
    left?: string;
    right?: string;
  }>;
}

export default async function CompareRoute(props: CompareRouteProps) {
  const { left, right } = await props.searchParams;

  return <CompareLaunchesPage initialLeftId={left} initialRightId={right} />;
}

