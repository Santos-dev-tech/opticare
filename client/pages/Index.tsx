import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Phone, Mail, Eye, Calendar, Plus, Search } from "lucide-react";
import { useState } from "react";

// Mock patient data
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
  },
];

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const filteredPatients = MOCK_PATIENTS.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  const selectedPatient = MOCK_PATIENTS.find((p) => p.id === selectedPatientId);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Patient Management</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Manage and track patient records and appointments
            </p>
          </div>
          <Link
            to="/new-patient"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 md:px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm md:text-base whitespace-nowrap"
          >
            <Plus size={20} />
            Add Patient
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {MOCK_PATIENTS.length}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users size={24} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {MOCK_PATIENTS.filter((p) =>
                    new Date(p.lastVisit) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <Calendar size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Appointment</p>
                <p className="text-lg font-bold text-foreground mt-2">Today</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <Eye size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {MOCK_PATIENTS.filter((p) => p.status === "Pending Review").length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Eye size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Patient Records</h2>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Patient List */}
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedPatientId === patient.id
                        ? "bg-primary/5 border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{patient.phone}</p>
                        <p className="text-sm text-muted-foreground">{patient.prescription}</p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          patient.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Detail Panel */}
          <div>
            {selectedPatient ? (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6 h-fit sticky top-8">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">Patient Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold text-foreground">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-semibold text-foreground">{selectedPatient.age}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={16} />
                    <a
                      href={`tel:${selectedPatient.phone}`}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {selectedPatient.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={16} />
                    <a
                      href={`mailto:${selectedPatient.email}`}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {selectedPatient.email}
                    </a>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Prescription</p>
                    <p className="font-mono text-sm font-semibold text-foreground mt-1">
                      {selectedPatient.prescription}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Visit</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Appointment</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {new Date(selectedPatient.nextAppointment).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <Link
                    to={`/patient/${selectedPatient.id}`}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors text-center"
                  >
                    View Full Record
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-8 text-center text-muted-foreground">
                <Eye size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a patient to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Add missing import
import { Users } from "lucide-react";
