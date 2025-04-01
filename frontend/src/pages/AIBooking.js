"use client"

import { useState } from "react"
import { useTheme } from '../contexts/ThemeContext'

export default function KIBuchung() {
  const { mode } = useTheme()
  const [activeTab, setActiveTab] = useState("arzttermin")
  const [insuranceType, setInsuranceType] = useState("Gesetzlich")
  const [timeSlot, setTimeSlot] = useState("Vormittag")
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleTimeSelect = (time) => {
    setTimeSlot(time)
    setShowTimeDropdown(false)
  }

  const handleInsuranceSelect = (insurance) => {
    setInsuranceType(insurance)
    setShowInsuranceDropdown(false)
  }

  return (
    <div className="min-h-screen bg-[#0f1120]" style={{
      color: mode === 'dark' ? "#ffffff" : "#1e293b",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif",
    }}>
      <div style={{ maxWidth: "64rem", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              background: "linear-gradient(90deg, #ff0066, #3399ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            KI-gestützte Terminbuchung
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
              maxWidth: "36rem",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Überlassen Sie die Terminkoordination unserer fortschrittlichen KI und sparen Sie wertvolle Zeit. Wählen Sie
            einfach die passende Kategorie und lassen Sie uns den Rest für Sie erledigen.
          </p>
        </header>

        {/* Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          marginBottom: "2rem",
          backgroundColor: "#1a1f3e",
          padding: "0.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          border: "1px solid #2a2f4e"
        }}>
          <button
            onClick={() => handleTabChange("arzttermin")}
            style={{
              flex: 1,
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              background: activeTab === "arzttermin" 
                ? "linear-gradient(90deg, #ff0066, #3399ff)"
                : "transparent",
              color: activeTab === "arzttermin" ? "white" : mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Arzttermin
          </button>
          <button
            onClick={() => handleTabChange("restaurant")}
            style={{
              flex: 1,
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              background: activeTab === "restaurant" 
                ? "linear-gradient(90deg, #ff0066, #3399ff)"
                : "transparent",
              color: activeTab === "restaurant" ? "white" : mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Restaurant
          </button>
          <button
            onClick={() => handleTabChange("friseur")}
            style={{
              flex: 1,
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              background: activeTab === "friseur" 
                ? "linear-gradient(90deg, #ff0066, #3399ff)"
                : "transparent",
              color: activeTab === "friseur" ? "white" : mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Friseur
          </button>
        </div>

        {/* Form Container */}
        <div
          style={{
            backgroundColor: "#1a1f3e",
            borderRadius: "1rem",
            padding: "2rem",
            marginBottom: "1.5rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            border: "1px solid #2a2f4e"
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
            {activeTab === "arzttermin" && "Arzttermin buchen"}
            {activeTab === "restaurant" && "Restaurant reservieren"}
            {activeTab === "friseur" && "Friseurtermin buchen"}
          </h2>
          <p style={{ fontSize: "0.9rem", color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b", marginBottom: "2rem" }}>
            {activeTab === "arzttermin" && "Füllen Sie das Formular aus, um einen Arzttermin zu buchen"}
            {activeTab === "restaurant" && "Füllen Sie das Formular aus, um einen Tisch zu reservieren"}
            {activeTab === "friseur" && "Füllen Sie das Formular aus, um einen Friseurtermin zu buchen"}
          </p>

          {/* Form Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {/* Dynamic fields based on active tab */}
            {activeTab === "arzttermin" && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="Name des Arztes"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Fachrichtung"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <select
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  >
                    <option value="">Dringlichkeit auswählen</option>
                    <option value="akut">Akut</option>
                    <option value="routine">Routinemäßig</option>
                  </select>
                </div>
                <div>
                  <select
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  >
                    <option value="">Art des Termins</option>
                    <option value="erstgespraech">Erstgespräch</option>
                    <option value="nachfolgetermin">Nachfolgetermin</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === "restaurant" && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="Name des Restaurants"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Anzahl der Personen"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <input
                    type="time"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </>
            )}

            {activeTab === "friseur" && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="Name des Salons"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Gewünschte Dienstleistung"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <select
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  >
                    <option value="">Haarlänge auswählen</option>
                    <option value="kurz">Kurz</option>
                    <option value="mittel">Mittel</option>
                    <option value="lang">Lang</option>
                  </select>
                </div>
                <div>
                  <select
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  >
                    <option value="">Haartyp auswählen</option>
                    <option value="glatt">Glatt</option>
                    <option value="wellig">Wellig</option>
                    <option value="lockig">Lockig</option>
                    <option value="gefärbt">Gefärbt</option>
                  </select>
                </div>
              </>
            )}

            {/* Date - Common for all tabs */}
            <div>
              <input
                type="text"
                placeholder="Datum"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                  border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  color: mode === 'dark' ? "white" : "#1e293b",
                  fontSize: "1rem",
                }}
              />
            </div>

            {/* Time - Common for all tabs */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                  border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              >
                <div>
                  <div style={{ fontSize: "0.875rem", color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b" }}>Zeitfenster</div>
                  <div>{timeSlot}</div>
                  <div style={{ fontSize: "0.75rem", color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b", marginTop: "0.25rem" }}>
                    {timeSlot === "Vormittag" ? "8:00 - 12:00 Uhr" : "13:00 - 17:00 Uhr"}
                  </div>
                </div>
                <span>▼</span>
              </div>

              {showTimeDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.5rem)",
                    left: "0",
                    width: "100%",
                    backgroundColor: "#1a1f3e",
                    border: "1px solid #2a2f4e",
                    borderRadius: "0.5rem",
                    zIndex: "10",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    onClick={() => handleTimeSelect("Vormittag")}
                  >
                    <div>
                      <div>Vormittag</div>
                      <div style={{ fontSize: "0.75rem", color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b" }}>8:00 - 12:00 Uhr</div>
                    </div>
                    {timeSlot === "Vormittag" && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={mode === 'dark' ? "#ff0066" : "#64748b"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    onClick={() => handleTimeSelect("Nachmittag")}
                  >
                    <div>
                      <div>Nachmittag</div>
                      <div style={{ fontSize: "0.75rem", color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b" }}>13:00 - 17:00 Uhr</div>
                    </div>
                    {timeSlot === "Nachmittag" && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={mode === 'dark' ? "#ff0066" : "#64748b"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Specific Time - Common for all tabs */}
            <div>
              <input
                type="time"
                placeholder="Genaue Uhrzeit (optional)"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                  border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  color: mode === 'dark' ? "white" : "#1e293b",
                  fontSize: "1rem",
                }}
              />
              <div style={{ fontSize: "0.75rem", color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "#64748b", marginTop: "0.25rem" }}>
                Falls Sie eine bestimmte Uhrzeit bevorzugen
              </div>
            </div>

            {/* Insurance - Only for doctor appointments */}
            {activeTab === "arzttermin" && (
              <>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowInsuranceDropdown(!showInsuranceDropdown)}
                  >
                    <span>Versicherungsart</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{insuranceType}</span>
                      <span>▼</span>
                    </div>
                  </div>

                  {showInsuranceDropdown && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 0.5rem)",
                        left: "0",
                        width: "100%",
                        backgroundColor: "#1a1f3e",
                        border: "1px solid #2a2f4e",
                        borderRadius: "0.5rem",
                        zIndex: "10",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      <div
                        style={{
                          padding: "0.75rem 1rem",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        onClick={() => handleInsuranceSelect("Gesetzlich")}
                      >
                        Gesetzlich
                      </div>
                      <div
                        style={{
                          padding: "0.75rem 1rem",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        onClick={() => handleInsuranceSelect("Privat")}
                      >
                        Privat
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Telefonnummer"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                      border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      color: mode === 'dark' ? "white" : "#1e293b",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </>
            )}

            {/* Phone - Full width for restaurant and hairdresser */}
            {(activeTab === "restaurant" || activeTab === "friseur") && (
              <div style={{ gridColumn: "span 2" }}>
                <input
                  type="text"
                  placeholder="Telefonnummer"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                    border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    color: mode === 'dark' ? "white" : "#1e293b",
                    fontSize: "1rem",
                  }}
                />
              </div>
            )}

            {/* Notes - Full Width for all tabs */}
            <div style={{ gridColumn: "span 2" }}>
              <textarea
                placeholder="Anmerkungen (optional)"
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  backgroundColor: mode === 'dark' ? "#1a1f3e" : "#ffffff",
                  border: mode === 'dark' ? "1px solid #2a2e45" : "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  color: mode === 'dark' ? "white" : "#1e293b",
                  fontSize: "1rem",
                  resize: "none",
                  minHeight: "100px",
                }}
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 2rem",
                background: "linear-gradient(90deg, #ff0066, #3399ff)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
            >
              {activeTab === "arzttermin" && "Termin buchen"}
              {activeTab === "restaurant" && "Tisch reservieren"}
              {activeTab === "friseur" && "Termin buchen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 