import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Calendar,
  TrendingUp,
  Download,
  Filter,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAllPatients, PatientData } from "@/services/patientService";
import { getAppointments, AppointmentData } from "@/services/appointmentService";

interface PatientStats {
  totalPatients: number;
  newPatientsThisMonth: number;
  newPatientsLastMonth: number;
  malePatients: number;
  femalePatients: number;
  otherPatients: number;
  averageAge: number;
}

interface AppointmentStats {
  totalAppointments: number;
  completedAppointments: number;
  scheduledAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
}

interface PrescriptionStats {
  totalPrescriptions: number;
  singleVision: number;
  bifocal: number;
  progressive: number;
  mostCommonFrameType: string;
  mostCommonLensType: string;
}

export default function Reports() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats | null>(null);
  const [prescriptionStats, setPrescriptionStats] = useState<PrescriptionStats | null>(null);
  const [selectedReport, setSelectedReport] = useState<string>("overview");

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [patients, appointments] = await Promise.all([
        getAllPatients(),
        getAppointments(),
      ]);

      // Calculate patient statistics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const newThisMonth = patients.filter((p) => {
        const createdAt = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt || "");
        return (
          createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear
        );
      }).length;

      const newLastMonth = patients.filter((p) => {
        const createdAt = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt || "");
        return createdAt.getMonth() === lastMonth && createdAt.getFullYear() === lastMonthYear;
      }).length;

      const maleCount = patients.filter((p) => p.sex === "male").length;
      const femaleCount = patients.filter((p) => p.sex === "female").length;
      const otherCount = patients.filter((p) => p.sex === "other").length;

      const avgAge = patients.length > 0
        ? Math.round(
            patients.reduce((sum, p) => sum + parseInt(p.age || "0"), 0) /
              patients.length,
          )
        : 0;

      setPatientStats({
        totalPatients: patients.length,
        newPatientsThisMonth: newThisMonth,
        newPatientsLastMonth: newLastMonth,
        malePatients: maleCount,
        femalePatients: femaleCount,
        otherPatients: otherCount,
        averageAge: avgAge,
      });

      // Calculate appointment statistics
      const completed = appointments.filter((a) => a.status === "completed").length;
      const scheduled = appointments.filter((a) => a.status === "scheduled").length;
      const cancelled = appointments.filter((a) => a.status === "cancelled").length;
      const noShow = appointments.filter((a) => a.status === "no-show").length;

      const completionRate =
        appointments.length > 0
          ? Math.round((completed / appointments.length) * 100)
          : 0;
      const cancellationRate =
        appointments.length > 0
          ? Math.round((cancelled / appointments.length) * 100)
          : 0;
      const noShowRate =
        appointments.length > 0
          ? Math.round((noShow / appointments.length) * 100)
          : 0;

      setAppointmentStats({
        totalAppointments: appointments.length,
        completedAppointments: completed,
        scheduledAppointments: scheduled,
        cancelledAppointments: cancelled,
        noShowAppointments: noShow,
        completionRate,
        cancellationRate,
        noShowRate,
      });

      // Calculate prescription statistics
      const singleVision = patients.filter(
        (p) => p.lensType?.toLowerCase().includes("single")
      ).length;
      const bifocal = patients.filter(
        (p) => p.lensType?.toLowerCase().includes("bifocal")
      ).length;
      const progressive = patients.filter(
        (p) => p.lensType?.toLowerCase().includes("progressive")
      ).length;

      // Find most common frame and lens types
      const frameTypes: { [key: string]: number } = {};
      const lensTypes: { [key: string]: number } = {};

      patients.forEach((p) => {
        if (p.frameType) {
          frameTypes[p.frameType] = (frameTypes[p.frameType] || 0) + 1;
        }
        if (p.lensType) {
          lensTypes[p.lensType] = (lensTypes[p.lensType] || 0) + 1;
        }
      });

      const mostCommonFrame = Object.entries(frameTypes).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0] || "N/A";
      const mostCommonLens = Object.entries(lensTypes).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0] || "N/A";

      setPrescriptionStats({
        totalPrescriptions: patients.length,
        singleVision,
        bifocal,
        progressive,
        mostCommonFrameType: mostCommonFrame,
        mostCommonLensType: mostCommonLens,
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Error loading report data:", err);
      setError("Failed to load report data");
      setIsLoading(false);
    }
  };

  const handleExport = (format: "pdf" | "csv") => {
    // Placeholder for export functionality
    alert(`Export as ${format.toUpperCase()} coming soon!`);
  };

  const StatCard = ({
    label,
    value,
    change,
    icon: Icon,
    color,
  }: {
    label: string;
    value: string | number;
    change?: string;
    icon: React.ComponentType<{ size: number }>;
    color: string;
  }) => (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && <p className="text-xs text-green-600 mt-2">{change}</p>}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 max-w-6xl">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
          </div>
          <div className="bg-card border border-border rounded-xl p-8 text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6 max-w-6xl">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              <Download size={18} />
              Export PDF
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center gap-2 border border-border text-foreground px-4 py-2.5 rounded-lg hover:bg-muted transition-colors font-medium text-sm"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            View key metrics and insights about your practice performance
          </p>
        </div>

        {/* Report Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setSelectedReport("overview")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              selectedReport === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedReport("patients")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              selectedReport === "patients"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Patient Analytics
          </button>
          <button
            onClick={() => setSelectedReport("appointments")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              selectedReport === "appointments"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setSelectedReport("prescriptions")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              selectedReport === "prescriptions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Prescriptions
          </button>
        </div>

        {/* Overview Tab */}
        {selectedReport === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Patients"
                value={patientStats?.totalPatients || 0}
                change={`+${patientStats?.newPatientsThisMonth || 0} this month`}
                icon={Users}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                label="Appointments"
                value={appointmentStats?.totalAppointments || 0}
                change={`${appointmentStats?.completionRate || 0}% completion rate`}
                icon={Calendar}
                color="bg-green-100 text-green-600"
              />
              <StatCard
                label="Completion Rate"
                value={`${appointmentStats?.completionRate || 0}%`}
                icon={TrendingUp}
                color="bg-purple-100 text-purple-600"
              />
              <StatCard
                label="Avg. Patient Age"
                value={patientStats?.averageAge || 0}
                icon={Eye}
                color="bg-orange-100 text-orange-600"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Breakdown */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Patient Demographics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Male</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{
                            width: `${
                              patientStats?.totalPatients
                                ? (patientStats.malePatients /
                                    patientStats.totalPatients) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-foreground w-12 text-right">
                        {patientStats?.malePatients || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Female</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-pink-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-600"
                          style={{
                            width: `${
                              patientStats?.totalPatients
                                ? (patientStats.femalePatients /
                                    patientStats.totalPatients) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-foreground w-12 text-right">
                        {patientStats?.femalePatients || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Other</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-600"
                          style={{
                            width: `${
                              patientStats?.totalPatients
                                ? (patientStats.otherPatients /
                                    patientStats.totalPatients) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-foreground w-12 text-right">
                        {patientStats?.otherPatients || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Status */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Appointment Status Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Completed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-green-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{
                            width: `${
                              appointmentStats?.totalAppointments
                                ? (appointmentStats.completedAppointments /
                                    appointmentStats.totalAppointments) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-foreground w-12 text-right">
                        {appointmentStats?.completedAppointments || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Scheduled</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{
                            width: `${
                              appointmentStats?.totalAppointments
                                ? (appointmentStats.scheduledAppointments /
                                    appointmentStats.totalAppointments) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-foreground w-12 text-right">
                        {appointmentStats?.scheduledAppointments || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cancelled</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-red-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600"
                          style={{
                            width: `${
                              appointmentStats?.totalAppointments
                                ? (appointmentStats.cancelledAppointments /
                                    appointmentStats.totalAppointments) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-foreground w-12 text-right">
                        {appointmentStats?.cancelledAppointments || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient Analytics Tab */}
        {selectedReport === "patients" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Total Patients"
                value={patientStats?.totalPatients || 0}
                icon={Users}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                label="New Patients (This Month)"
                value={patientStats?.newPatientsThisMonth || 0}
                icon={TrendingUp}
                color="bg-green-100 text-green-600"
              />
              <StatCard
                label="New Patients (Last Month)"
                value={patientStats?.newPatientsLastMonth || 0}
                icon={Users}
                color="bg-purple-100 text-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Gender Distribution
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Male</span>
                      <span className="text-sm font-semibold">
                        {patientStats?.malePatients || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${
                            patientStats?.totalPatients
                              ? (patientStats.malePatients /
                                  patientStats.totalPatients) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Female</span>
                      <span className="text-sm font-semibold">
                        {patientStats?.femalePatients || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-600"
                        style={{
                          width: `${
                            patientStats?.totalPatients
                              ? (patientStats.femalePatients /
                                  patientStats.totalPatients) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Other</span>
                      <span className="text-sm font-semibold">
                        {patientStats?.otherPatients || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-600"
                        style={{
                          width: `${
                            patientStats?.totalPatients
                              ? (patientStats.otherPatients /
                                  patientStats.totalPatients) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Age Insights
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Average Patient Age
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {patientStats?.averageAge || 0} years
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {patientStats?.totalPatients || 0} patients
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {selectedReport === "appointments" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Appointments"
                value={appointmentStats?.totalAppointments || 0}
                icon={Calendar}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                label="Completion Rate"
                value={`${appointmentStats?.completionRate || 0}%`}
                icon={TrendingUp}
                color="bg-green-100 text-green-600"
              />
              <StatCard
                label="Cancellation Rate"
                value={`${appointmentStats?.cancellationRate || 0}%`}
                icon={AlertCircle}
                color="bg-yellow-100 text-yellow-600"
              />
              <StatCard
                label="No-Show Rate"
                value={`${appointmentStats?.noShowRate || 0}%`}
                icon={Users}
                color="bg-red-100 text-red-600"
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Appointment Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {appointmentStats?.completedAppointments || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {appointmentStats?.scheduledAppointments || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Scheduled</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {appointmentStats?.cancelledAppointments || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Cancelled</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">
                    {appointmentStats?.noShowAppointments || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">No-Show</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {selectedReport === "prescriptions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Total Prescriptions"
                value={prescriptionStats?.totalPrescriptions || 0}
                icon={Eye}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                label="Most Common Frame Type"
                value={prescriptionStats?.mostCommonFrameType || "N/A"}
                icon={Eye}
                color="bg-purple-100 text-purple-600"
              />
              <StatCard
                label="Most Common Lens Type"
                value={prescriptionStats?.mostCommonLensType || "N/A"}
                icon={Eye}
                color="bg-orange-100 text-orange-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  Lens Type Distribution
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Single Vision</span>
                      <span className="text-sm font-semibold">
                        {prescriptionStats?.singleVision || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${
                            prescriptionStats?.totalPrescriptions
                              ? (prescriptionStats.singleVision /
                                  prescriptionStats.totalPrescriptions) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Bifocal</span>
                      <span className="text-sm font-semibold">
                        {prescriptionStats?.bifocal || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{
                          width: `${
                            prescriptionStats?.totalPrescriptions
                              ? (prescriptionStats.bifocal /
                                  prescriptionStats.totalPrescriptions) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progressive</span>
                      <span className="text-sm font-semibold">
                        {prescriptionStats?.progressive || 0}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600"
                        style={{
                          width: `${
                            prescriptionStats?.totalPrescriptions
                              ? (prescriptionStats.progressive /
                                  prescriptionStats.totalPrescriptions) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">
                  Popular Choices
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Most Common Frame Type
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {prescriptionStats?.mostCommonFrameType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Most Common Lens Type
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {prescriptionStats?.mostCommonLensType || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
