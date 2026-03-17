import DashboardLayout from '../../components/DashboardLayout';

export default function DashboardAppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
