"use client";

import { useState, useSyncExternalStore, FormEvent } from "react";

type Contact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
};

const MAX_CONTACTS = 4;

const DEFAULT_CONTACTS: Contact[] = [
  { id: "c-1", name: "Sarah", relation: "Daughter", phone: "+15551234567" },
  { id: "c-2", name: "David", relation: "Son", phone: "+15559876543" },
  { id: "c-3", name: "Dr. Smith", relation: "Doctor", phone: "+15552468100" },
];

function subscribeContacts(callback: () => void) {
  window.addEventListener("saathi-contacts-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("saathi-contacts-change", callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedContactsRaw = "";
let cachedContacts: Contact[] = DEFAULT_CONTACTS;

function getContactsSnapshot(): Contact[] {
  if (typeof window === "undefined") return DEFAULT_CONTACTS;
  try {
    const raw = localStorage.getItem("saathi-contacts");
    if (!raw) {
      localStorage.setItem("saathi-contacts", JSON.stringify(DEFAULT_CONTACTS));
      return DEFAULT_CONTACTS;
    }
    if (raw !== cachedContactsRaw) {
      cachedContactsRaw = raw;
      cachedContacts = (JSON.parse(raw) as Contact[]).slice(0, MAX_CONTACTS);
    }
    return cachedContacts;
  } catch {
    return DEFAULT_CONTACTS;
  }
}

function getContactsServerSnapshot(): Contact[] {
  return DEFAULT_CONTACTS;
}

function saveContactsList(updated: Contact[]) {
  const limited = updated.slice(0, MAX_CONTACTS);
  localStorage.setItem("saathi-contacts", JSON.stringify(limited));
  window.dispatchEvent(new Event("saathi-contacts-change"));
}

type FamilyAiResult = {
  message: string;
  safeNextStep: string;
};

export default function FamilyPage() {
  const contacts = useSyncExternalStore(
    subscribeContacts,
    getContactsSnapshot,
    getContactsServerSnapshot,
  );

  const [statusMessage, setStatusMessage] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);

  // New contact fields
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");

  // AI draft message state
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftResult, setDraftResult] = useState<FamilyAiResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContactPhone, setSelectedContactPhone] = useState("");

  function handleAddContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (contacts.length >= MAX_CONTACTS) {
      setStatusMessage(`You can save up to ${MAX_CONTACTS} contacts.`);
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setStatusMessage("Please enter both a name and phone number.");
      return;
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: name.trim(),
      relation: relation.trim() || "Family",
      phone: cleanPhone,
    };

    const updated = [...contacts, newContact];
    saveContactsList(updated);
    setName("");
    setRelation("");
    setPhone("");
    setShowAddContact(false);
    setStatusMessage(`Saved contact for ${newContact.name}.`);
  }

  function handleDeleteContact(id: string, contactName: string) {
    if (!confirm(`Delete contact for ${contactName}?`)) return;
    const updated = contacts.filter((c) => c.id !== id);
    saveContactsList(updated);
    setStatusMessage(`Removed ${contactName}.`);
  }

  async function handleDraftMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = draftPrompt.trim();
    if (!trimmed) {
      setStatusMessage("Please enter what you want to tell them.");
      return;
    }

    setIsLoading(true);
    setDraftResult(null);
    setStatusMessage("Writing a clear and kind message. Please wait...");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "family", text: trimmed, lang: "en" }),
      });

      if (!response.ok) throw new Error("Could not draft message.");
      const data = (await response.json()) as FamilyAiResult;
      setDraftResult(data);
      setStatusMessage("Message draft ready.");
    } catch {
      setDraftResult({
        message: `Hello, could you please help me with something when you have a moment? ${trimmed}`,
        safeNextStep: "Share only what you feel comfortable sharing and call them directly if urgent.",
      });
      setStatusMessage("Could not connect to online assistant. Here is a safe draft.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopyMessage() {
    if (!draftResult) return;
    navigator.clipboard.writeText(draftResult.message);
    setStatusMessage("Message copied to clipboard!");
  }

  return (
    <section className="family-page">
      <header className="page-header">
        <h1>Family & Support</h1>
        <p>Stay connected with one tap. Reach loved ones by phone or WhatsApp anytime.</p>
      </header>

      <section className="contacts-section" aria-labelledby="contacts-heading">
        <div className="section-header-row">
          <h2 id="contacts-heading">
            📞 Your Contacts ({contacts.length}/{MAX_CONTACTS})
          </h2>
          {contacts.length < MAX_CONTACTS ? (
            <button
              type="button"
              className="setting-button"
              onClick={() => setShowAddContact(!showAddContact)}
              aria-expanded={showAddContact}
            >
              {showAddContact ? "✕ Close Form" : "➕ Add Contact"}
            </button>
          ) : (
            <p className="contact-limit-note">Maximum 4 contacts saved</p>
          )}
        </div>

        {showAddContact && (
          <form className="add-contact-form" onSubmit={handleAddContact}>
            <h3>Add a Contact (up to {MAX_CONTACTS})</h3>
            <label htmlFor="contact-name">Name</label>
            <input
              id="contact-name"
              type="text"
              required
              placeholder="e.g. Sarah"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="contact-rel">Relationship</label>
            <input
              id="contact-rel"
              type="text"
              placeholder="e.g. Daughter, Caregiver, Doctor"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
            />

            <label htmlFor="contact-phone">Phone Number (with country code)</label>
            <input
              id="contact-phone"
              type="tel"
              required
              placeholder="e.g. +1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="button-group">
              <button type="submit" className="primary-button">
                Save Contact
              </button>
              <button
                type="button"
                className="setting-button"
                onClick={() => setShowAddContact(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <ul className="contacts-list" aria-label="Family contacts list">
          {contacts.map((contact) => {
            const cleanPhone = contact.phone.replace(/[^0-9]/g, "");
            return (
              <li key={contact.id} className="contact-card">
                <div className="contact-info">
                  <h3>{contact.name}</h3>
                  <p className="contact-meta">
                    <span className="contact-relation">{contact.relation}</span>
                    <span className="contact-number">{contact.phone}</span>
                  </p>
                </div>

                <div className="contact-actions">
                  <a
                    className="primary-button call-btn"
                    href={`tel:${contact.phone}`}
                    aria-label={`Call ${contact.name}`}
                  >
                    📞 Call
                  </a>
                  <a
                    className="setting-button whatsapp-btn"
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp message to ${contact.name}`}
                  >
                    💬 WhatsApp
                  </a>
                  <button
                    type="button"
                    className="setting-button delete-btn"
                    onClick={() => handleDeleteContact(contact.id, contact.name)}
                    aria-label={`Delete ${contact.name}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="draft-section" aria-labelledby="draft-heading">
        <h2 id="draft-heading">✍️ Help Me Write a Message</h2>
        <p>
          Tell us what you want to say, and we will write a polite, simple message you can send to
          your family.
        </p>

        <form onSubmit={handleDraftMessage}>
          <label htmlFor="draft-prompt">What would you like to tell them?</label>
          <textarea
            id="draft-prompt"
            maxLength={1000}
            rows={4}
            placeholder="e.g. Ask my daughter if she can pick up my prescription or visit this Sunday."
            value={draftPrompt}
            onChange={(e) => setDraftPrompt(e.target.value)}
          />
          <p className="character-count">{draftPrompt.length}/1000 characters</p>

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Writing message…" : "Create Message for Family"}
          </button>
        </form>

        <p aria-live="polite" className="status-message">
          {statusMessage}
        </p>

        {draftResult && (
          <article className="result-card draft-result-card" aria-labelledby="draft-result-title">
            <div>
              <h3 id="draft-result-title">Suggested Message</h3>
              <blockquote className="draft-message-quote">
                &ldquo;{draftResult.message}&rdquo;
              </blockquote>

              <p className="safe-note">
                <strong>Next Step:</strong> {draftResult.safeNextStep}
              </p>

              <div className="action-buttons">
                <button type="button" className="primary-button" onClick={handleCopyMessage}>
                  📋 Copy Message
                </button>

                {contacts.length > 0 && (
                  <div className="send-whatsapp-group">
                    <label htmlFor="select-contact-send" className="sr-only">
                      Select contact to send WhatsApp
                    </label>
                    <select
                      id="select-contact-send"
                      className="setting-button"
                      value={selectedContactPhone || contacts[0]?.phone}
                      onChange={(e) => setSelectedContactPhone(e.target.value)}
                    >
                      {contacts.map((c) => (
                        <option key={c.id} value={c.phone}>
                          Send to {c.name} ({c.relation})
                        </option>
                      ))}
                    </select>
                    <a
                      className="primary-button whatsapp-send-button"
                      href={`https://wa.me/${(
                        selectedContactPhone || contacts[0]?.phone || ""
                      ).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(draftResult.message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 Send via WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>
          </article>
        )}
      </section>
    </section>
  );
}
