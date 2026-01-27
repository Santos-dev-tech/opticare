import { Layout } from "@/components/Layout";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Phone, Mail, Calendar, Eye, FileText } from "lucide-react";

// Mock data - same as in Index
const MOCK_PATIENTS = [
  {
    id: 1,
    name: "Sarah Johnson",
    age: 34,
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    lastVisit: "2024-01-15",
    prescription: "OD: -2.50, OS: -2.75",
    nextAppointment: "2024-02-20",
    status: "Active",
    dob: "1990-03-15",
    address: "123 Main St, Springfield, IL 62701",
    insurance: "Blue Cross Blue Shield",
    notes: "Patient has mild astigmatism. Prefers contact lenses.",
  },
  {
    id: 2,
    name: "Michael Chen",
    age: 52,
    email: "m.chen@email.com",
    phone: "(555) 234-5678",
    lastVisit: "2024-01-22",
    prescription: "OD: +1.25, OS: +1.00",
    nextAppointment: "2024-03-10",
    status: "Active",
    dob: "1971-06-20",
    address: "456 Oak Ave, Springfield, IL 62702",
    insurance: "Aetna",
    notes: "Presbyopia. Uses progressive lenses.",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    age: 28,
    email: "emily.r@email.com",
    phone: "(555) 345-6789",
    lastVisit: "2024-01-10",
    prescription: "OD: -3.00, OS: -2.50",
    nextAppointment: "2024-02-15",
    status: "Pending Review",
    dob: "1995-11-08",
    address: "789 Pine Rd, Springfield, IL 62703",
    insurance: "UnitedHealthcare",
    notes: "Recent prescription change. Monitor for any discomfort.",
  },
  {
    id: 4,
    name: "Robert Williams",
    age: 67,
    email: "r.williams@email.com",
    phone: "(555) 456-7890",
    lastVisit: "2024-01-05",
    prescription: "OD: +2.50, OS: +2.75",
    nextAppointment: "2024-03-05",
    status: "Active",
    dob: "1956-08-12",
    address: "321 Maple Dr, Springfield, IL 62704",
    insurance: "Medicare",
    notes: "Bifocal prescription. Annual checkup recommended.",
  },
  {
    id: 5,
    name: "Jessica Lee",
    age: 41,
    email: "j.lee@email.com",
    phone: "(555) 567-8901",
    lastVisit: "2023-12-20",
    prescription: "OD: -1.75, OS: -1.50",
    nextAppointment: "2024-02-28",
    status: "Active",
    dob: "1982-09-25",
    address: "654 Elm St, Springfield, IL 62705",
    insurance: "Cigna",
    notes: "Occasional dry eyes. Recommended artificial tears.",
  },
];

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = MOCK_PATIENTS.find((p) => p.id === parseInt(id || "0"));

  if (!patient) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Patient not found</p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Edit size={18} />
            Edit Patient
          </button>
        </div>

        {/* Patient Header Card */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">{patient.name}</h1>
              <p className="text-muted-foreground mt-2">Age: {patient.age} years old</p>
              <div className="mt-4 flex gap-4">
                <a
                  href={`tel:${patient.phone}`}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Phone size={18} />
                  {patient.phone}
                </a>
                <a
                  href={`mailto:${patient.email}`}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Mail size={18} />
                  {patient.email}
                </a>
              </div>
            </div>
            <span
              className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                patient.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {patient.status}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="text-foreground font-medium mt-1">{patient.dob}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-foreground font-medium mt-1">{patient.age} years</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-foreground font-medium mt-1">{patient.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Insurance Provider</p>
                  <p className="text-foreground font-medium mt-1">{patient.insurance}</p>
                </div>
              </div>
            </div>

            {/* Vision Prescription */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye size={20} className="text-secondary" />
                Current Prescription
              </h2>
              <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-8 text-center">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Right Eye (OD)
                    </p>
                    <p className="text-2xl font-mono font-bold text-foreground mt-3">
                      {patient.prescription.split(",")[0].trim().split(": ")[1]}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Left Eye (OS)
                    </p>
                    <p className="text-2xl font-mono font-bold text-foreground mt-3">
                      {patient.prescription.split(",")[1].trim().split(": ")[1]}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Last prescribed: {new Date(patient.lastVisit).toLocaleDateString()}
              </p>
            </div>

            {/* Clinical Notes */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Clinical Notes</h2>
              <p className="text-foreground leading-relaxed">{patient.notes}</p>
            </div>
          </div>

          {/* Right Column - Appointments & Quick Actions */}
          <div className="space-y-6">
            {/* Next Appointment */}
            <div className="bg-gradient-to-br from-secondary/10 to-accent/10 border border-secondary/30 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Next Appointment
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <Calendar size={24} className="text-secondary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {new Date(patient.nextAppointment).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(patient.nextAppointment).toLocaleDateString("en-US", {
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <button className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors font-medium">
                Reschedule
              </button>
            </div>

            {/* Last Visit */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Last Visit
              </h3>
              <p className="text-xl font-bold text-foreground">
                {new Date(patient.lastVisit).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {Math.floor((Date.now() - new Date(patient.lastVisit).getTime()) / (1000 * 60 * 60 * 24))}{" "}
                days ago
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-2">
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
              <button className="w-full text-left px-4 py-2.5 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm font-medium">
                Schedule Appointment
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-lg bg-secondary/5 text-secondary hover:bg-secondary/10 transition-colors text-sm font-medium">
                Add Prescription
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-lg bg-accent/5 text-accent hover:bg-accent/10 transition-colors text-sm font-medium">
                Print Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
