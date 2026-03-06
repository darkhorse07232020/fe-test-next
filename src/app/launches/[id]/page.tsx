import LaunchDetailPage from "@/components/LaunchDetailPage";

interface LaunchDetailRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LaunchDetailRoute(props: LaunchDetailRouteProps) {
  const { id } = await props.params;
  return <LaunchDetailPage id={id} />;
}

