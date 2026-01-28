import { Layout } from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Edit2, Trash2, Calendar, Clock, User, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getAppointments,
  bookAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  AppointmentData,
} from "@/services/appointmentService";
import { getAllPatients, PatientData } from "@/services/patientService";

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [formData, setFormData] = useState<Partial<AppointmentData>>({
    patientId: "",
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    duration: 30,
    status: "scheduled",
    notes: "",
    reasonForVisit: "",
  });

  // Load appointments and patients
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const appointmentsData = await getAppointments();
      setAppointments(appointmentsData || []);
    } catch (err) {
      console.error("Error loading appointments:", err);
      setAppointments([]);
    }

    try {
      const patientsData = await getAllPatients();
      setPatients(patientsData || []);
    } catch (err) {
      console.error("Error loading patients:", err);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPatientId = e.target.value;
    const selectedPatient = patients.find((p) => p.id === selectedPatientId);

    if (selectedPatient) {
      setFormData((prev) => ({
        ...prev,
        patientId: selectedPatient.id || "",
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientEmail: selectedPatient.email,
        patientPhone: selectedPatient.phone,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.patientId || !formData.appointmentDate || !formData.appointmentTime) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateAppointment(editingId, formData);
        setSuccessMessage("Appointment updated successfully!");
      } else {
        await bookAppointment(formData as AppointmentData);
        setSuccessMessage("Appointment booked successfully!");
      }

      resetForm();
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save appointment";
      setError(errorMessage);
    }
  };

  const handleEdit = (appointment: AppointmentData) => {
    setFormData(appointment);
    setEditingId(appointment.id || null);
    setShowBookingForm(true);
  };

  const handleCancel = async (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelAppointment(appointmentId);
        setSuccessMessage("Appointment cancelled successfully!");
        await loadData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to cancel appointment";
        setError(errorMessage);
      }
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteAppointment(appointmentId);
        setSuccessMessage("Appointment deleted successfully!");
        await loadData();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete appointment";
        setError(errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      appointmentDate: "",
      appointmentTime: "",
      duration: 30,
      status: "scheduled",
      notes: "",
      reasonForVisit: "",
    });
    setEditingId(null);
    setShowBookingForm(false);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reasonForVisit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
  };

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
          <button
            onClick={() => {
              resetForm();
              setShowBookingForm(true);
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={20} />
            Book Appointment
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Appointments</h1>
          <p className="text-muted-foreground">Track and manage all patient appointments</p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Booking Form */}
        {showBookingForm && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {editingId ? "Edit Appointment" : "Book New Appointment"}
              </h2>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Patient *
                  </label>
                  <select
                    name="patientId"
                    value={formData.patientId || ""}
                    onChange={handlePatientSelect}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Reason for Visit *
                  </label>
                  <input
                    type="text"
                    name="reasonForVisit"
                    value={formData.reasonForVisit || ""}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Eye exam, Contact lens fitting..."
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Appointment Time *
                  </label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration || 30}
                    onChange={handleInputChange}
                    min="15"
                    max="240"
                    step="15"
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status || "scheduled"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about the appointment..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  {editingId ? "Update Appointment" : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        {!showBookingForm && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search by patient name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {!showBookingForm && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center py-16">
                <Calendar className="w-12 h-12 text-secondary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Appointments</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || filterStatus !== "all"
                    ? "No appointments match your search criteria"
                    : "No appointments booked yet"}
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowBookingForm(true);
                  }}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <Plus size={20} />
                  Book First Appointment
                </button>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <User size={18} />
                            {appointment.patientName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {appointment.reasonForVisit}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={16} />
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={16} />
                          {appointment.appointmentTime} ({appointment.duration} min)
                        </div>
                        <div className="text-muted-foreground">
                          {appointment.patientEmail}
                        </div>
                      </div>

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {appointment.status === "scheduled" && (
                        <>
                          <button
                            onClick={() => handleEdit(appointment)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit appointment"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleCancel(appointment.id || "")}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel appointment"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(appointment.id || "")}
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete appointment"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
