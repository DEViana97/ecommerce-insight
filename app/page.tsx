import DashboardLayout from '../components/DashboardLayout';
import DashboardPage from '../features/dashboard/DashboardPage';

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}
