"use client";

import { useState, FormEvent } from "react";
import { useMedicines, formatTimeDisplay, isMedicineTakenToday } from "@/lib/medicines";

export default function MedicinesPage() {
  const { medicines, addMedicine, removeMedicine, toggleMedicineTaken, resetDefaults } =
    useMedicines();
  const [statusMessage, setStatusMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New med form state
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newTime, setNewTime] = useState("08:00");
  const [newInstructions, setNewInstructions] = useState("");

  function handleToggle(id: string, name: string) {
    toggleMedicineTaken(id);
    const med = medicines.find((m) => m.id === id);
    const taken = med ? isMedicineTakenToday(med) : false;
    setStatusMessage(`${name} marked as ${taken ? "not taken" : "taken"}.`);
  }

  function handleAddMedicine(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim()) {
      setStatusMessage("Please enter the medicine name.");
      return;
    }

    addMedicine({
      name: newName.trim(),
      dosage: newDosage.trim() || "1 dose",
      time: newTime,
      instructions: newInstructions.trim(),
    });

    setNewName("");
    setNewDosage("");
    setNewInstructions("");
    setShowAddForm(false);
    setStatusMessage(`Added ${newName.trim()} to your schedule.`);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    removeMedicine(id);
    setStatusMessage(`Removed ${name} from schedule.`);
  }

  return (
    <section className="medicines-page">
      <header className="page-header">
        <h1>My Medicines</h1>
        <p>Keep track of your daily medicines with one tap. Everything is stored privately on this device.</p>
      </header>

      <div className="medicines-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => setShowAddForm(!showAddForm)}
          aria-expanded={showAddForm}
        >
          {showAddForm ? "✕ Close Form" : "➕ Add Medicine"}
        </button>
        <button type="button" className="setting-button" onClick={resetDefaults}>
          Reset Defaults
        </button>
      </div>

      {showAddForm && (
        <form className="add-medicine-form" onSubmit={handleAddMedicine}>
          <h2>Add New Medicine</h2>

          <label htmlFor="med-name">Medicine Name</label>
          <input
            id="med-name"
            type="text"
            required
            placeholder="e.g. Blood Pressure Pill"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <label htmlFor="med-dosage">Dosage / Amount</label>
          <input
            id="med-dosage"
            type="text"
            placeholder="e.g. 1 tablet (5mg)"
            value={newDosage}
            onChange={(e) => setNewDosage(e.target.value)}
          />

          <label htmlFor="med-time">Time of Day</label>
          <input
            id="med-time"
            type="time"
            required
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />

          <label htmlFor="med-instructions">Special Instructions (optional)</label>
          <input
            id="med-instructions"
            type="text"
            placeholder="e.g. Take with food and a glass of water"
            value={newInstructions}
            onChange={(e) => setNewInstructions(e.target.value)}
          />

          <div className="button-group">
            <button type="submit" className="primary-button">
              Save Medicine
            </button>
            <button type="button" className="setting-button" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <p aria-live="polite" className="status-message">
        {statusMessage}
      </p>

      <ul className="medicines-list" aria-label="Medicine schedule list">
        {medicines.map((med) => {
          const taken = isMedicineTakenToday(med);
          return (
            <li key={med.id} className={`medicine-card ${taken ? "card-taken" : ""}`}>
              <div className="medicine-main">
                <div className="medicine-header">
                  <h2>{med.name}</h2>
                  <span className="medicine-time">⏰ {formatTimeDisplay(med.time)}</span>
                </div>
                <p className="medicine-dosage">
                  <strong>Dosage:</strong> {med.dosage}
                </p>
                {med.instructions && (
                  <p className="medicine-instructions">ℹ️ {med.instructions}</p>
                )}
                {taken && (
                  <p className="taken-badge" aria-label="Status: Taken today">
                    ✓ Taken today
                  </p>
                )}
              </div>

              <div className="medicine-controls">
                <button
                  type="button"
                  className={`primary-button big-taken-button ${taken ? "button-taken" : ""}`}
                  onClick={() => handleToggle(med.id, med.name)}
                  aria-label={`${taken ? "Undo taken for" : "Mark as taken"} ${med.name}`}
                >
                  {taken ? "✓ Taken" : "Mark Taken"}
                </button>
                <button
                  type="button"
                  className="setting-button delete-button"
                  onClick={() => handleDelete(med.id, med.name)}
                  aria-label={`Remove ${med.name} from schedule`}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
