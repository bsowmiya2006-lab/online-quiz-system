import React, { useState, useEffect, useRef, useMemo } from "react";
import quizData from "./QuizData";
import Login from "./Login";
import Register from "./Register";
import Admin from "./Admin";
import "./App.css";

import purpleBgImg from "./assets/purple.jpg";
import certificateBgImg from "./assets/certificate_template.png";
import medalFirst from "./assets/medal_1st.png";
import medalSecond from "./assets/medal_2nd.png";
import medalThird from "./assets/medal_3rd.png";
import medalFourth from "./assets/medal_4th.png";
import medalFifth from "./assets/medal_5th.png";
import medalSixth from "./assets/medal_6th.png";
import medalParticipant from "./assets/medal_participant.png";

// 🌟 Real College Logos
import collegeLogoImg from "./assets/images (3).png";
import universityLogoImg from "./assets/images.png";
import govtLogoImg from "./assets/images (2).png";

const defaultCourseLogos = {
  Python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  Java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  "C++": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  JavaScript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  DSA: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg",
  DBMS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  Cloud: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
  SoftwareEng: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
  MachineLearning: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
  OS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  OOP: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  GenAI: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg",
  DataScience: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg"
};

const BACKEND = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:3001" : window.location.protocol + "//" + window.location.hostname + ":3001");

export default function App() {
  const [isLoginView, setIsLoginView] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [userData, setUserData] = useState({ username: "", college_name: "WAVOO WAJEEHA WOMEN'S COLLEGE OF ARTS AND SCIENCE" });

  const [viewState, setViewState] = useState("auth");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("Easy");

  const [availableTopics, setAvailableTopics] = useState([]);
  const [courseLogosMap, setCourseLogosMap] = useState(defaultCourseLogos);

  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isAccepted, setIsAccepted] = useState(false);

  // Guidance / acceptance
  const [guidanceAccepted, setGuidanceAccepted] = useState(false);

  // Camera & Verification States
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [idCaptured, setIdCaptured] = useState(false);
  const [faceImageUrl, setFaceImageUrl] = useState(null);
  const [idImageUrl, setIdImageUrl] = useState(null);
  const [verificationStep, setVerificationStep] = useState("face"); // "face" | "id" | "preview"
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);
  const [certSettings, setCertSettings] = useState({});

  // Feedback States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [adVideoUrl, setAdVideoUrl] = useState("");
  const [questionLimit, setQuestionLimit] = useState(25);
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef(null);

  // ─── INIT ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BACKEND}/advertisement`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success" && data.video_url) {
          setAdVideoUrl(data.video_url);
        } else if (data.status === "success" && !data.video_url) {
          setAdVideoUrl("");
        }
      })
      .catch(console.error);

    fetch(`${BACKEND}/certificate-settings`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === "object") {
          setCertSettings(data);
        }
      })
      .catch(console.error);

    const savedLimit = localStorage.getItem("quizQuestionLimit");
    if (savedLimit) setQuestionLimit(Number(savedLimit));

    const savedTimerMins = localStorage.getItem("quizTimerMinutes");
    if (savedTimerMins) setTimeLeft(Number(savedTimerMins) * 60);

    const customTopics = JSON.parse(localStorage.getItem("adminCustomTopicsList"));
    if (customTopics && customTopics.length > 0) {
      setAvailableTopics(customTopics);
      const newLogoMap = { ...defaultCourseLogos };
      customTopics.forEach(t => { newLogoMap[t.name] = t.logo; });
      setCourseLogosMap(newLogoMap);
    } else {
      const defaultList = Object.keys(defaultCourseLogos).map(k => ({ name: k, logo: defaultCourseLogos[k] }));
      setAvailableTopics(defaultList);
    }
  }, [viewState]);

  // ─── CAMERA ATTACHMENT HOOK ──────────────────────────────────────────
  useEffect(() => {
    if (viewState === "camera-capture" && videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(e => {
        console.warn("Video play interrupted/handled:", e);
      });
    }
  }, [stream, verificationStep, viewState]);

  // ─── TIMER ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (viewState === "quiz" && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setViewState("review");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (viewState !== "quiz" && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [viewState]);

  // ─── PROCTORING: TAB SWITCH ──────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && viewState === "quiz") {
        fetch(`${BACKEND}/proctoring/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: userData.username, message: "Student switched tabs or left screen", time: new Date().toLocaleString() })
        }).catch(err => console.error(err));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [viewState, userData.username]);

  // ─── HELPERS ─────────────────────────────────────────────────────────
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ─── CAMERA ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser context. Please use a modern browser (Chrome/Edge/Firefox) over HTTPS or localhost.");
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false
      });
      setStream(s);
      setCameraPermissionGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(e => console.warn("Camera play:", e));
      }
      return s;
    } catch (e) {
      console.error("Camera access failed:", e);
      let msg = "Camera access denied or unavailable. Please check your browser camera permissions.";
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        msg = "Camera permission was denied. Please click the camera icon in your browser address bar to allow camera access and try again.";
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        msg = "No webcam or camera device was found on this system.";
      } else if (e.name === "NotReadableError" || e.name === "TrackStartError") {
        msg = "Camera is currently in use by another application. Please close other camera programs and try again.";
      }
      setCameraError(msg);
      return null;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return null;
    const vid = videoRef.current;
    const canvas = document.createElement("canvas");
    const width = vid.videoWidth || 640;
    const height = vid.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(vid, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const handleAllowCamera = async () => {
    const s = await startCamera();
    setVerificationStep("face");
    setViewState("camera-capture");
  };

  const captureFacePhoto = () => {
    const dataUrl = captureFrame();
    if (!dataUrl) {
      alert("Please ensure the camera preview is visible before capturing!");
      return;
    }
    setFaceImageUrl(dataUrl);
    setFaceCaptured(true);
    // Send to backend
    fetch(`${BACKEND}/proctoring/images`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: userData.username, type: "face", image: dataUrl, time: new Date().toLocaleString() })
    }).catch(e => console.error("Face photo upload error:", e));
    setVerificationStep("id");
  };

  const captureIdPhoto = () => {
    const dataUrl = captureFrame();
    if (!dataUrl) {
      alert("Please ensure the camera preview is visible before capturing!");
      return;
    }
    setIdImageUrl(dataUrl);
    setIdCaptured(true);
    // Send to backend
    fetch(`${BACKEND}/proctoring/images`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: userData.username, type: "id", image: dataUrl, time: new Date().toLocaleString() })
    }).catch(e => console.error("ID photo upload error:", e));
    stopCamera();
    setVerificationStep("preview");
  };

  const handleRetakePhotos = async () => {
    setFaceCaptured(false);
    setIdCaptured(false);
    setFaceImageUrl(null);
    setIdImageUrl(null);
    setVerificationStep("face");
    await startCamera();
  };

  const handleSubmitVerification = () => {
    stopCamera();
    setVerificationSubmitted(true);
    setViewState("course-select");
  };

  // ─── COURSE / LEVEL / QUIZ ───────────────────────────────────────────
  const handleCourseSelect = (courseName) => {
    setSelectedCourse(courseName);
    setViewState("level-select");
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    const customAdminQuestions = JSON.parse(localStorage.getItem(`adminQuestions_${selectedCourse}`)) || [];
    const baseQuestions = customAdminQuestions.length > 0
      ? customAdminQuestions
      : (quizData[selectedCourse] || [
        { id: 1, question: `Sample Question 1 for ${selectedCourse}`, options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option A" },
        { id: 2, question: `Sample Question 2 for ${selectedCourse}`, options: ["Option A", "Option B", "Option C", "Option D"], answer: "Option B" }
      ]);

    const randomizedPool = shuffleArray(baseQuestions).map(q => ({
      ...q, options: shuffleArray(q.options)
    }));

    const fixedDeck = randomizedPool.slice(0, questionLimit);
    setActiveQuestions(fixedDeck);
    setCurrentQuestion(0);
    setSelectedAnswers({});

    const savedTimerMins = Number(localStorage.getItem("quizTimerMinutes")) || 10;
    setTimeLeft(savedTimerMins * 60);
    setIsAccepted(false);
    setViewState("quiz");
  };

  const handleAnswerSelection = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: option });
  };

  const handleVerifyNext = () => {
    if (currentQuestion + 1 < activeQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setViewState("review");
    }
  };

  const score = useMemo(() => {
    return activeQuestions.reduce((acc, q, idx) => selectedAnswers[idx] === q.answer ? acc + 1 : acc, 0);
  }, [activeQuestions, selectedAnswers]);

  const handleQuizSubmit = () => {
    if (!isAccepted) return;
    // Save quiz result to backend
    const percentage = activeQuestions.length > 0 ? Math.round((score / activeQuestions.length) * 100) : 0;
    fetch(`${BACKEND}/quiz-results`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: userData.username, course: selectedCourse, level: selectedLevel,
        score, total: activeQuestions.length, percentage, date: new Date().toISOString()
      })
    }).catch(e => console.error(e));
    setViewState("result");
  };

  // ─── AWARD / BADGE ───────────────────────────────────────────────────
  const getAwardDetails = () => {
    const total = activeQuestions.length;
    if (total === 0) return { rank: "Participant", title: "PARTICIPANT", colorBg: "#9333EA", medalImg: medalParticipant };
    const percentage = (score / total) * 100;
    if (percentage === 100) return { rank: "1st Rank", title: "FIRST PLACE", colorBg: "#FFD700", medalImg: medalFirst };
    if (percentage >= 85) return { rank: "2nd Rank", title: "SECOND PLACE", colorBg: "#E2E8F0", medalImg: medalSecond };
    if (percentage >= 70) return { rank: "3rd Rank", title: "THIRD PLACE", colorBg: "#D97706", medalImg: medalThird };
    if (percentage >= 50) return { rank: "4th Rank", title: "FOURTH PLACE", colorBg: "#059669", medalImg: medalFourth };
    if (percentage >= 35) return { rank: "5th Rank", title: "FIFTH PLACE", colorBg: "#DC2626", medalImg: medalFifth };
    if (percentage >= 20) return { rank: "6th Rank", title: "SIXTH PLACE", colorBg: "#2563EB", medalImg: medalSixth };
    return { rank: "Participant", title: "PARTICIPANT", colorBg: "#9333EA", medalImg: medalParticipant };
  };

  const awardDetails = getAwardDetails();

  // ─── RESTART ─────────────────────────────────────────────────────────
  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setIsAccepted(false);
    setSelectedCourse(null);
    setActiveQuestions([]);
    setViewState("course-select");
  };

  // ─── FEEDBACK ────────────────────────────────────────────────────────
  const handleSaveFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    const feedbackObj = { username: userData.username, rating, text: feedbackText, date: new Date().toISOString() };
    try {
      await fetch(`${BACKEND}/feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackObj)
      });
    } catch (err) { console.error(err); }
    setFeedbackSubmitted(true);
  };

  // ─── AUTH HANDLERS ───────────────────────────────────────────────────
  const handleLoginSuccess = (userPayload) => {
    if (userPayload && userPayload.username) {
      setUserData({
        username: userPayload.username,
        college_name: userPayload.college_name || "WAVOO WAJEEHA WOMEN'S COLLEGE OF ARTS AND SCIENCE"
      });
    }
    setIsNewRegistration(false);
    setIsAuthenticated(true);
    setViewState("course-select"); // Existing students skip verification
  };

  const handleRegisterSuccess = (userPayload) => {
    if (userPayload && userPayload.username) {
      setUserData({
        username: userPayload.username,
        college_name: userPayload.college_name || "WAVOO WAJEEHA WOMEN'S COLLEGE OF ARTS AND SCIENCE"
      });
    }
    setIsNewRegistration(true);
    setIsAuthenticated(true);
    setGuidanceAccepted(false);
    setViewState("guidance"); // New students → guidance first
  };

  // ─── CERTIFICATE ─────────────────────────────────────────────────────
  const handleOpenCertificatePage = () => {
    const certWindow = window.open("", "_blank");
    if (!certWindow) return;
    const adminCertUrl = certSettings.certTemplateUrl || localStorage.getItem("adminCertTemplateUrl");
    const certBgUrl = adminCertUrl ? adminCertUrl : certificateBgImg;
    const currentDateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const subjectLogoUrl = courseLogosMap[selectedCourse] || defaultCourseLogos["Python"];
    const signatoryTitle = certSettings.signatoryTitle || "Authorized Signatory";
    const signatoryName = certSettings.signatoryName || "Authorized";
    const universityName = certSettings.universityName || "MANONMANIAM SUNDARANAR UNIVERSITY";
    const collegeName = userData.college_name || certSettings.collegeName || "WAVOO WAJEEHA WOMEN'S COLLEGE OF ARTS AND SCIENCE";

    certWindow.document.write(`
      <html>
        <head>
          <title>Certificate of Participation</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Montserrat', sans-serif; background: #1a0a2e; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; padding: 30px 20px; }
            .cert-wrap { width: 100%; max-width: 1000px; position: relative; }
            .certificate-box {
              position: relative; width: 100%; aspect-ratio: 1400/980;
              background-image: url('${certBgUrl}');
              background-size: 100% 100%; background-repeat: no-repeat;
              background-position: center; background-color: #fffdf8;
              border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.7);
              border: 3px solid rgba(249,115,22,0.5); overflow: hidden;
            }
            .watermark {
              position: absolute; top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.07; z-index: 1; pointer-events: none;
              width: 38%; height: auto; object-fit: contain;
            }
            .content-layer {
              position: absolute; top: 0; left: 0; right: 0; bottom: 0;
              z-index: 2; display: flex; flex-direction: column;
              justify-content: space-between; align-items: center;
              padding: 4% 6%;
            }
            .logos-row {
              display: flex; gap: 3%; align-items: center;
              justify-content: center; width: 100%;
            }
            .logo-item { width: 7%; max-width: 70px; height: auto; object-fit: contain; }
            .cert-main { text-align: center; width: 100%; }
            .cert-heading { font-size: 3.5vw; font-weight: 900; letter-spacing: 3px; color: #1e293b; margin-bottom: 0.3em; }
            .cert-sub { font-size: 1.3vw; font-weight: 700; color: #64748b; letter-spacing: 2px; margin-bottom: 0.8em; }
            .cert-present { font-size: 1.1vw; font-weight: 600; color: #475569; margin-bottom: 0.3em; }
            .cert-name { font-size: 3vw; font-weight: 900; border-bottom: 3px solid #f97316; display: inline-block; padding: 0 3%; margin: 0.3em 0; color: #0f172a; }
            .cert-body { font-size: 1.1vw; font-weight: 600; color: #334155; max-width: 80%; line-height: 1.6; margin: 0 auto; }
            .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; }
            .cert-date { text-align: left; }
            .cert-date-label { font-size: 1vw; font-weight: bold; color: #64748b; }
            .cert-date-val { font-size: 1.3vw; font-weight: 800; color: #0f172a; margin-top: 0.2em; background: rgba(255,255,255,0.8); padding: 2px 8px; border-radius: 4px; }
            .cert-sign { text-align: center; }
            .cert-sig-name { font-family: 'Brush Script MT', cursive; font-size: 2.5vw; color: #1e293b; font-weight: bold; }
            .cert-sig-line { width: 12vw; height: 2px; background: #0f172a; margin: 0.3em auto; }
            .cert-sig-label { font-size: 0.9vw; font-weight: bold; color: #64748b; }
            .btn-row { display: flex; gap: 12px; margin-top: 20px; }
            .btn-print { padding: 12px 28px; background: #ec4899; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; }
            .btn-close { padding: 12px 28px; background: #334155; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 15px; }
          </style>
        </head>
        <body>
          <div class="cert-wrap">
            <div class="certificate-box">
              <img src="${subjectLogoUrl}" class="watermark" alt="Watermark" />
              <div class="content-layer">
                <div class="logos-row">
                  <img src="${collegeLogoImg}" class="logo-item" alt="College Logo" />
                  <img src="${universityLogoImg}" class="logo-item" alt="University Logo" />
                  <img src="${govtLogoImg}" class="logo-item" alt="Govt Logo" />
                </div>
                <div class="cert-main">
                  <p class="cert-sub">${universityName}</p>
                  <p class="cert-present">${collegeName}</p>
                  <h1 class="cert-heading">CERTIFICATE</h1>
                  <p style="font-size:1.3vw;font-weight:700;color:#475569;letter-spacing:2px;margin-bottom:0.8em;">OF PARTICIPATION</p>
                  <p class="cert-present">THIS IS PROUDLY PRESENTED TO</p>
                  <h2 class="cert-name">${userData.username}</h2>
                  <p class="cert-body">
                    For successfully demonstrating exceptional dedication, active participation, and completing the assessment in
                    <b>${selectedCourse || "Assessment"}</b> (${selectedLevel}) with remarkable enthusiasm at
                    <b>${collegeName}</b>.
                  </p>
                </div>
                <div class="cert-footer">
                  <div class="cert-date">
                    <p class="cert-date-label">Date Issued:</p>
                    <p class="cert-date-val">${currentDateStr}</p>
                  </div>
                  <div class="cert-sign">
                    <p class="cert-sig-name">${signatoryName}</p>
                    <div class="cert-sig-line"></div>
                    <p class="cert-sig-label">${signatoryTitle}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="btn-row">
              <button class="btn-print" onclick="window.print()">🖨 Print / Download PDF</button>
              <button class="btn-close" onclick="window.close()">✕ Close</button>
            </div>
          </div>
        </body>
      </html>
    `);
    certWindow.document.close();
  };

  // ─── ADMIN ROUTE ─────────────────────────────────────────────────────
  if (viewState === "admin") {
    return <Admin onLogout={() => setViewState("auth")} />;
  }

  // ─── STYLES ──────────────────────────────────────────────────────────
  const btnStyle = {
    background: "linear-gradient(135deg, #e066a3, #8b5cf6)",
    color: "#fff", border: "none", padding: "13px 20px",
    borderRadius: "12px", cursor: "pointer", fontWeight: "bold",
    fontSize: "15px", width: "100%", marginBottom: "10px",
    boxShadow: "0 0 15px rgba(224,102,163,0.5)",
    transition: "transform 0.2s"
  };

  // ─── RENDER ──────────────────────────────────────────────────────────
  return (
    <div className="app-container student-theme" style={{ minHeight: "100vh", alignItems: "center", paddingTop: "40px", paddingBottom: "40px" }}>

      {/* Admin Icon — only on auth page */}
      {viewState === "auth" && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000 }}>
          <button
            onClick={() => setViewState("admin")}
            style={{ background: "rgba(255,255,255,0.9)", border: "2px solid #cbd5e1", borderRadius: "50%", width: "46px", height: "46px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            title="Admin Login"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      )}

      <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>

        {/* ═══ AUTH ═══ */}
        {viewState === "auth" && !isAuthenticated && (
          isLoginView === null ? (
            <div className="quiz-box">
              <h1 style={{ fontSize: "26px", fontWeight: "900", marginBottom: "8px", color: "#fff" }}>Online Quiz System</h1>
              <p style={{ color: "#f3e7be", marginBottom: "30px", fontSize: "14px" }}>
                WAVOO WAJEEHA WOMEN'S COLLEGE OF ARTS AND SCIENCE
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <button onClick={() => setIsLoginView(true)} className="next-btn" style={{ margin: 0 }}>Login</button>
                <button onClick={() => setIsLoginView(false)} className="next-btn" style={{ margin: 0 }}>Register</button>
              </div>
            </div>
          ) : isLoginView ? (
            <Login onLoginSuccess={handleLoginSuccess} navigateToRegister={() => setIsLoginView(false)} />
          ) : (
            <Register onRegisterSuccess={handleRegisterSuccess} navigateToLogin={() => setIsLoginView(true)} />
          )
        )}

        {/* ═══ GUIDANCE PAGE ═══ */}
        {viewState === "guidance" && (
          <div className="quiz-box" style={{ maxWidth: "650px", textAlign: "left" }}>
            <h2 style={{ textAlign: "center", color: "#c084fc", marginBottom: "5px", fontSize: "22px" }}>
              📋 Welcome to Online Quiz System
            </h2>
            <p style={{ textAlign: "center", color: "#f3e7be", fontSize: "13px", marginBottom: "15px" }}>
              Please read the following information carefully before proceeding.
            </p>

            <ol className="guidance-list">
              {[
                "The Online Quiz System is a digital platform designed for college students to assess their knowledge across multiple technical subjects.",
                "You can use this system to take quizzes on 13 different topics including Python, Java, C++, JavaScript, DSA, DBMS, Cloud, and more.",
                "This system uses face photo and college ID card photo verification to ensure that the correct student is participating.",
                "A face photo is required to verify your identity before starting the quiz. This helps maintain the integrity of the assessment.",
                "A college ID card photo is required to confirm your enrollment in the college and validate your participation.",
                "These photos are used solely for student verification and safety purposes. Your data is stored securely.",
                "You should provide your own clear face photo using the webcam camera on your device.",
                "You should also provide a clear photo of your college ID card using the same webcam camera.",
                "The face and ID card photos will be reviewed by the administrator to verify your participation.",
                "After successful photo submission, you will be redirected to the Topics page to begin your quiz.",
                "After completing verification, you can select any of the 13 quiz topics available on the Topics page.",
                "Each topic has three difficulty levels: Easy, Medium, and Hard. Choose the level that matches your preparation.",
                "During the quiz, you must answer all questions before the timer runs out. Click the option to select your answer.",
                "After completing the quiz, you can view your Score, Percentage, Certificate of Participation, and Achievement Badge.",
                "After completing the quiz, you can submit your feedback from the Feedback page to help us improve the system."
              ].map((point, i) => (
                <li key={i}>
                  <span className="g-num">{i + 1}</span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "18px", marginTop: "10px" }}>
              <div className="checkbox-row" style={{ justifyContent: "center", marginBottom: "18px" }}>
                <input
                  type="checkbox"
                  id="guidance-accept"
                  checked={guidanceAccepted}
                  onChange={e => setGuidanceAccepted(e.target.checked)}
                />
                <label htmlFor="guidance-accept" style={{ color: "#fff", fontSize: "15px", cursor: "pointer", whiteSpace: "nowrap" }}>
                  I have read and accept the terms and conditions above
                </label>
              </div>
              <button
                onClick={() => setViewState("camera-permission")}
                disabled={!guidanceAccepted}
                className="next-btn"
                style={{ margin: 0, opacity: guidanceAccepted ? 1 : 0.45 }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ═══ CAMERA PERMISSION REQUEST ═══ */}
        {viewState === "camera-permission" && (
          <div className="quiz-box" style={{ maxWidth: "480px", textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "15px" }}>📷</div>
            <h2 style={{ color: "#c084fc", marginBottom: "10px" }}>Camera Permission Required</h2>
            <p style={{ color: "#e2e8f0", fontSize: "14px", marginBottom: "20px", lineHeight: "1.6" }}>
              To complete your verification, we need access to your device camera to capture:
            </p>
            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px", marginBottom: "22px", textAlign: "left" }}>
              <p style={{ color: "#f3e7be", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🤳</span> <strong>Step 1:</strong> Your face photo for identity verification
              </p>
              <p style={{ color: "#f3e7be", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🪪</span> <strong>Step 2:</strong> Your college ID card photo for enrollment confirmation
              </p>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "20px" }}>
              When your browser asks for camera permission, click <strong style={{ color: "#34d399" }}>"Allow"</strong> to proceed.
            </p>
            <button onClick={handleAllowCamera} className="next-btn" style={{ margin: 0 }}>
              📷 Allow Camera & Start Verification
            </button>
            <button onClick={() => setViewState("guidance")} style={{ marginTop: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#cbd5e1", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", width: "100%" }}>
              ← Back to Information
            </button>
          </div>
        )}

        {/* ═══ CAMERA CAPTURE (Face → ID → Preview) ═══ */}
        {viewState === "camera-capture" && (
          <div className="quiz-box" style={{ maxWidth: "520px", textAlign: "center" }}>
            {cameraError && (
              <div className="camera-error-banner">
                <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>⚠️ Camera Notice:</p>
                <p style={{ margin: 0 }}>{cameraError}</p>
                <button 
                  onClick={startCamera} 
                  style={{ marginTop: "10px", background: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
                >
                  🔄 Retry Camera Access
                </button>
              </div>
            )}

            {verificationStep === "face" && (
              <>
                <h2 style={{ color: "#c084fc", marginBottom: "8px" }}>📸 Step 1: Face Photo</h2>
                <p style={{ color: "#cbd5e1", fontSize: "13px", marginBottom: "16px" }}>
                  Look directly at the camera. Make sure your face is clearly visible.
                </p>
                <div style={{ background: "#000", height: "240px", borderRadius: "12px", overflow: "hidden", marginBottom: "16px", border: "2px solid rgba(236,72,153,0.5)", position: "relative" }}>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
                <button onClick={captureFacePhoto} className="next-btn" style={{ margin: 0 }}>
                  📸 Capture Face Photo
                </button>
              </>
            )}

            {verificationStep === "id" && (
              <>
                <h2 style={{ color: "#c084fc", marginBottom: "8px" }}>🪪 Step 2: College ID Card Photo</h2>
                <p style={{ color: "#cbd5e1", fontSize: "13px", marginBottom: "16px" }}>
                  Hold your college ID card clearly in front of the camera and capture it.
                </p>
                <div style={{ background: "#000", height: "240px", borderRadius: "12px", overflow: "hidden", marginBottom: "16px", border: "2px solid rgba(236,72,153,0.5)", position: "relative" }}>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", borderRadius: "10px", padding: "10px", marginBottom: "16px" }}>
                  <p style={{ margin: 0, color: "#34d399", fontSize: "13px" }}>✔ Face photo captured successfully!</p>
                </div>
                <button onClick={captureIdPhoto} className="next-btn" style={{ margin: 0 }}>
                  🪪 Capture ID Card Photo
                </button>
              </>
            )}

            {verificationStep === "preview" && (
              <>
                <h2 style={{ color: "#c084fc", marginBottom: "8px" }}>✅ Review Your Photos</h2>
                <p style={{ color: "#e2e8f0", fontSize: "14px", marginBottom: "18px" }}>
                  Please review both photos before submitting. Both photos have been saved for verification.
                </p>
                <div className="photo-preview-row">
                  <div className="photo-preview-card">
                    <img src={faceImageUrl} alt="Face Photo" />
                    <p>Face Photo</p>
                  </div>
                  <div className="photo-preview-card">
                    <img src={idImageUrl} alt="College ID Card" />
                    <p>College ID Card Photo</p>
                  </div>
                </div>
                <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid #10b981", borderRadius: "10px", padding: "12px", margin: "16px 0" }}>
                  <p style={{ margin: 0, color: "#34d399", fontSize: "14px", fontWeight: "bold" }}>
                    ✔ Both photos captured and saved permanently!
                  </p>
                  <p style={{ margin: "6px 0 0 0", color: "#86efac", fontSize: "12px" }}>
                    These will be reviewed by the administrator for verification.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                  <button onClick={handleSubmitVerification} className="next-btn" style={{ margin: 0 }}>
                    Submit & Continue to Topics →
                  </button>
                  <button 
                    onClick={handleRetakePhotos} 
                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#cbd5e1", padding: "10px 16px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    🔄 Retake Photos
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ COURSE SELECT (Topics) ═══ */}
        {viewState === "course-select" && (
          <div className="quiz-box" style={{ maxWidth: "580px" }}>
            <h2 style={{ marginBottom: "6px", color: "#fff" }}>Welcome, {userData.username} 👋</h2>
            <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "18px" }}>{userData.college_name}</p>

            {/* LINK (left) and FEEDBACK (right) */}
            <div className="topics-action-row">
              <button className="link-btn" onClick={() => setViewState("link-page")}>
                🔗 LINK
              </button>
              <button className="feedback-btn" onClick={() => { setRating(0); setFeedbackText(""); setFeedbackSubmitted(false); setViewState("feedback-page"); }}>
                ⭐ FEEDBACK
              </button>
            </div>

            <p style={{ color: "#f3e7be", fontSize: "14px", marginBottom: "14px" }}>Select from available courses/topics below:</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "9px", maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>
              {availableTopics.map(course => (
                <button
                  key={course.name}
                  onClick={() => handleCourseSelect(course.name)}
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 15px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "12px", color: "#fff", cursor: "pointer", textAlign: "left", width: "100%", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(224,102,163,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                >
                  <img src={courseLogosMap[course.name] || course.logo} alt={course.name} style={{ width: "32px", height: "32px", objectFit: "contain" }}
                    onError={e => { e.target.src = defaultCourseLogos["Python"]; }} />
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>{course.name} Quiz</span>
                </button>
              ))}
            </div>

            {adVideoUrl && (
              <div style={{ marginTop: "25px", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "20px" }}>
                <h3 style={{ color: "#c084fc", fontSize: "16px", marginBottom: "10px", textAlign: "center" }}>Advertisement</h3>
                <video 
                  src={`${BACKEND}${adVideoUrl}`} 
                  controls 
                  playsInline
                  style={{ width: "100%", borderRadius: "12px", border: "2px solid rgba(192, 132, 252, 0.4)" }}
                />
              </div>
            )}
          </div>
        )}

        {/* ═══ LINK PAGE ═══ */}
        {viewState === "link-page" && (
          <div className="quiz-box" style={{ maxWidth: "520px", textAlign: "center" }}>
            <h2 style={{ color: "#c084fc", marginBottom: "8px" }}>🔗 Share Quiz Link</h2>
            <p style={{ color: "#f3e7be", fontSize: "14px", marginBottom: "22px" }}>
              Share the Online Quiz System with your friends and classmates using the links below.
            </p>

            {/* Copy URL */}
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 8px 0" }}>Quiz System URL:</p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input readOnly value={window.location.origin} style={{ flex: 1, background: "#0f172a", border: "1px solid #334155", color: "#fff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }} />
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.origin); alert("✅ Quiz link copied! Share it via WhatsApp or any platform."); }}
                  style={{ background: "linear-gradient(135deg, #e066a3, #8b5cf6)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap" }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { name: "WhatsApp", icon: "💬", color: "#25d366", url: `https://wa.me/?text=${encodeURIComponent("🎓 Join our Online Quiz System! Test your knowledge here: " + window.location.origin)}` },
                { name: "Facebook", icon: "👥", color: "#1877f2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}` },
                { name: "Instagram", icon: "📸", color: "#e1306c", url: "https://www.instagram.com/" },
                { name: "Twitter / X", icon: "🐦", color: "#1da1f2", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent("🎓 Take this quiz! " + window.location.origin)}` }
              ].map(({ name, icon, color, url }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 18px", background: `${color}22`, border: `1px solid ${color}55`, borderRadius: "12px", color: "#fff", textDecoration: "none", fontSize: "15px", fontWeight: "bold", transition: "background 0.2s" }}
                >
                  <span style={{ fontSize: "22px" }}>{icon}</span>
                  <span>Share on {name}</span>
                  <span style={{ marginLeft: "auto", color: color }}>→</span>
                </a>
              ))}
            </div>

            <button onClick={() => setViewState("course-select")} style={{ marginTop: "20px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#cbd5e1", padding: "11px 20px", borderRadius: "10px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>
              ← Back to Topics
            </button>
          </div>
        )}

        {/* ═══ FEEDBACK PAGE ═══ */}
        {viewState === "feedback-page" && (
          <div className="quiz-box" style={{ maxWidth: "480px", textAlign: "center" }}>
            <h2 style={{ color: "#c084fc", marginBottom: "8px" }}>⭐ Submit Your Feedback</h2>
            <p style={{ color: "#f3e7be", fontSize: "14px", marginBottom: "22px" }}>We value your opinion! Rate your experience.</p>

            {feedbackSubmitted ? (
              <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", borderRadius: "12px", padding: "30px 20px" }}>
                <div style={{ fontSize: "50px", marginBottom: "12px" }}>🎉</div>
                <h3 style={{ color: "#34d399", marginBottom: "8px" }}>Thank You!</h3>
                <p style={{ color: "#86efac", fontSize: "14px" }}>Your feedback has been saved permanently and will help us improve the system.</p>
                <button onClick={() => setViewState("course-select")} style={{ marginTop: "20px", ...btnStyle }}>
                  ← Back to Topics
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveFeedback}>
                {/* Star Rating */}
                <div style={{ marginBottom: "18px" }}>
                  <p style={{ color: "#f3e7be", fontSize: "14px", marginBottom: "10px" }}>Rate your experience:</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                        style={{ fontSize: "36px", cursor: "pointer", color: (hoverRating || rating) >= star ? "#fbbf24" : "#475569", transition: "color 0.15s, transform 0.15s", transform: (hoverRating || rating) >= star ? "scale(1.15)" : "scale(1)" }}
                      >★</span>
                    ))}
                  </div>
                  {rating > 0 && <p style={{ color: "#fbbf24", fontSize: "13px", marginTop: "6px" }}>
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][rating]}
                  </p>}
                </div>

                {/* Text Feedback */}
                <textarea
                  placeholder="Write your feedback here... (optional)"
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  rows={4}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", resize: "vertical", boxSizing: "border-box", marginBottom: "16px" }}
                />

                <button type="submit" disabled={rating === 0} className="next-btn"
                  style={{ margin: 0, opacity: rating > 0 ? 1 : 0.45 }}>
                  Submit Feedback ✓
                </button>
              </form>
            )}

            {!feedbackSubmitted && (
              <button onClick={() => setViewState("course-select")} style={{ marginTop: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#cbd5e1", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", width: "100%" }}>
                ← Back to Topics
              </button>
            )}
          </div>
        )}

        {/* ═══ LEVEL SELECT ═══ */}
        {viewState === "level-select" && (
          <div className="quiz-box" style={{ maxWidth: "440px", textAlign: "center" }}>
            <h2 style={{ marginBottom: "6px", color: "#fff" }}>Select Difficulty Level</h2>
            <p style={{ color: "#f3e7be", fontSize: "14px", marginBottom: "24px" }}>Choose challenge level for <strong>{selectedCourse}</strong></p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button onClick={() => handleLevelSelect("Easy")} className="next-btn"
                style={{ margin: 0, background: "linear-gradient(135deg, #10b981, #059669)" }}>
                🟢 Easy Level ({questionLimit} Questions)
              </button>
              <button onClick={() => handleLevelSelect("Medium")} className="next-btn"
                style={{ margin: 0, background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                🟡 Medium Level ({questionLimit} Questions)
              </button>
              <button onClick={() => handleLevelSelect("Hard")} className="next-btn"
                style={{ margin: 0, background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                🔴 Hard Level ({questionLimit} Questions)
              </button>
              <button onClick={() => setViewState("course-select")} className="next-btn"
                style={{ margin: 0, background: "linear-gradient(135deg, #475569, #334155)" }}>
                ⬅ Back to Course
              </button>
            </div>
          </div>
        )}

        {/* ═══ QUIZ ═══ */}
        {viewState === "quiz" && activeQuestions.length > 0 && (
          <div className="quiz-box-wide">
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
              <h2 style={{ color: "#fff", margin: 0, fontSize: "20px" }}>{selectedCourse} Quiz</h2>
            </div>

            {/* Three-column layout */}
            <div className="quiz-three-col">
              {/* LEFT: Level */}
              <div className="quiz-col-left">
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Level</div>
                <div style={{
                  background: selectedLevel === "Easy" ? "linear-gradient(135deg,#10b981,#059669)" : selectedLevel === "Medium" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#ef4444,#dc2626)",
                  padding: "8px 14px", borderRadius: "10px", color: "#fff", fontWeight: "bold", fontSize: "14px"
                }}>
                  {selectedLevel === "Easy" ? "🟢" : selectedLevel === "Medium" ? "🟡" : "🔴"} {selectedLevel}
                </div>
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "5px" }}>Question</div>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: "#fff" }}>{currentQuestion + 1}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>of {activeQuestions.length}</div>
                </div>
              </div>

              {/* CENTER: Question + Options */}
              <div className="quiz-col-center">
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold", letterSpacing: "1px", marginBottom: "8px" }}>
                  {selectedCourse}
                </div>
                <h3 style={{ fontSize: "17px", color: "#fff", lineHeight: "1.55", marginBottom: "16px" }}>
                  {activeQuestions[currentQuestion].question}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  {activeQuestions[currentQuestion].options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentQuestion] === opt;
                    return (
                      <label
                        key={idx}
                        className={`option-row${isSelected ? " selected" : ""}`}
                        onClick={() => handleAnswerSelection(opt)}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQuestion}`}
                          value={opt}
                          checked={isSelected}
                          onChange={() => handleAnswerSelection(opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>

                <button onClick={handleVerifyNext} disabled={!selectedAnswers[currentQuestion]}
                  style={{ ...btnStyle, marginTop: "16px", marginBottom: 0, opacity: selectedAnswers[currentQuestion] ? 1 : 0.45 }}>
                  {currentQuestion + 1 < activeQuestions.length ? "Next Question →" : "Finish & Review"}
                </button>
              </div>

              {/* RIGHT: Timer */}
              <div className="quiz-col-right">
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Timer</div>
                <div style={{
                  background: timeLeft < 60 ? "rgba(239,68,68,0.2)" : "rgba(52,211,153,0.15)",
                  border: `2px solid ${timeLeft < 60 ? "#ef4444" : "#34d399"}`,
                  borderRadius: "12px", padding: "12px 14px", textAlign: "center",
                  fontSize: "28px", fontWeight: "900",
                  color: timeLeft < 60 ? "#f87171" : "#34d399",
                }}>
                  ⏱ {formatTime(timeLeft)}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", textAlign: "center" }}>Time Remaining</div>

                {/* Progress */}
                <div style={{ marginTop: "24px", width: "100%" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "5px", textAlign: "center" }}>Progress</div>
                  <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
                    <div style={{ width: `${((currentQuestion + 1) / activeQuestions.length) * 100}%`, background: "linear-gradient(90deg,#e066a3,#8b5cf6)", height: "100%", borderRadius: "4px", transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", textAlign: "center" }}>
                    {currentQuestion + 1}/{activeQuestions.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ REVIEW / SUBMIT CHECKPOINT ═══ */}
        {viewState === "review" && (
          <div className="quiz-box" style={{ maxWidth: "520px", textAlign: "center" }}>
            <h2 style={{ marginBottom: "10px", color: "#fff" }}>📋 Quiz Complete!</h2>
            <p style={{ color: "#e2e8f0", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
              You have answered all questions. Please accept and submit your quiz below.
            </p>

            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", marginBottom: "22px" }}>
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>Questions answered: <strong style={{ color: "#fff" }}>{Object.keys(selectedAnswers).length} / {activeQuestions.length}</strong></p>
            </div>

            <div className="checkbox-row" style={{ justifyContent: "center", marginBottom: "20px" }}>
              <input type="checkbox" id="quiz-accept" checked={isAccepted} onChange={e => setIsAccepted(e.target.checked)} />
              <label htmlFor="quiz-accept" style={{ color: "#fff", fontSize: "15px", cursor: "pointer", whiteSpace: "nowrap" }}>
                I Accept and Submit My Quiz
              </label>
            </div>

            <button onClick={handleQuizSubmit} disabled={!isAccepted} className="next-btn"
              style={{ margin: 0, opacity: isAccepted ? 1 : 0.45 }}>
              Submit & View Result ✓
            </button>
          </div>
        )}

        {/* ═══ RESULT PAGE ═══ */}
        {viewState === "result" && (
          <div className="quiz-box-wide" style={{ textAlign: "left" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#fff" }}>📊 Quiz Result</h2>
            <div className="result-container">

              {/* LEFT: Score + Actions */}
              <div className="result-card-left" style={{ border: `2px solid ${awardDetails.colorBg}` }}>
                {/* SCORE */}
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
                  <p style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "bold", margin: "0 0 4px 0" }}>SCORE</p>
                  <p style={{ fontSize: "28px", fontWeight: "900", color: "#fff", margin: 0 }}>{score} / {activeQuestions.length}</p>
                </div>

                {/* PERCENTAGE */}
                <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px", marginBottom: "18px" }}>
                  <p style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "bold", margin: "0 0 4px 0" }}>PERCENTAGE</p>
                  <p style={{ fontSize: "28px", fontWeight: "900", color: activeQuestions.length > 0 && score / activeQuestions.length >= 0.5 ? "#34d399" : "#f87171", margin: 0 }}>
                    {activeQuestions.length > 0 ? Math.round((score / activeQuestions.length) * 100) : 0}%
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button onClick={handleOpenCertificatePage} style={{ ...btnStyle, margin: 0, background: "linear-gradient(135deg, #f97316, #ec4899)" }}>
                    🎓 VIEW CERTIFICATE
                  </button>
                  <button onClick={() => setViewState("badges-view")} style={{ ...btnStyle, margin: 0, background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                    🏅 VIEW BADGES
                  </button>
                  <button onClick={restartQuiz} style={{ ...btnStyle, margin: 0, background: "linear-gradient(135deg, #10b981, #059669)" }}>
                    ⬅ BACK TO COURSE
                  </button>
                </div>
              </div>

              {/* RIGHT: Question Review */}
              <div className="result-card-right" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                <h4 style={{ color: "#fed7aa", margin: "0 0 14px 0" }}>📝 Question-by-Question Review</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {activeQuestions.map((q, idx) => {
                    const userAns = selectedAnswers[idx];
                    const isCorrect = userAns === q.answer;
                    return (
                      <div key={idx} style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "10px", borderLeft: `5px solid ${isCorrect ? "#10b981" : "#ef4444"}` }}>
                        <p style={{ margin: "0 0 5px 0", fontSize: "14px", fontWeight: "bold", color: "#fff" }}>
                          Q{idx + 1}: {q.question}
                        </p>
                        <p style={{ margin: "0 0 3px 0", fontSize: "13px", color: isCorrect ? "#34d399" : "#f87171" }}>
                          Your Answer: {userAns || "Not Answered"} {isCorrect ? "✔ Correct" : "✘ Wrong"}
                        </p>
                        {!isCorrect && (
                          <p style={{ margin: 0, fontSize: "13px", color: "#fbbf24" }}>
                            ✓ Correct Answer: {q.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Retake at bottom */}
                <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  <button onClick={() => { setSelectedCourse(null); setViewState("level-select"); setSelectedCourse(selectedCourse); handleLevelSelect(selectedLevel); }}
                    style={{ ...btnStyle, margin: 0, background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                    🔄 RETAKE QUIZ
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ═══ BADGES PAGE ═══ */}
        {viewState === "badges-view" && (
          <div className="quiz-box" style={{ maxWidth: "500px", textAlign: "center" }}>
            <h2 style={{ color: "#c084fc", marginBottom: "8px" }}>🏅 Your Earned Badge</h2>
            <p style={{ color: "#f3e7be", fontSize: "14px", marginBottom: "20px" }}>
              Congratulations, <strong>{userData.username}</strong>! You performed brilliantly in {selectedCourse}!
            </p>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
              <div style={{
                background: `radial-gradient(circle, ${awardDetails.colorBg}30, rgba(0,0,0,0.3))`,
                border: `2px solid ${awardDetails.colorBg}`,
                borderRadius: "20px", padding: "30px 40px", textAlign: "center",
                boxShadow: `0 0 30px ${awardDetails.colorBg}40`
              }}>
                <img src={awardDetails.medalImg} alt="Badge" style={{ width: "100px", height: "100px", objectFit: "contain", marginBottom: "16px" }} />
                <h3 style={{ color: awardDetails.colorBg, fontSize: "20px", margin: "0 0 6px 0", fontWeight: "900" }}>{awardDetails.title}</h3>
                <p style={{ color: "#f3e7be", fontSize: "14px", margin: "0 0 4px 0" }}>{userData.username}</p>
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>{selectedCourse} — {selectedLevel}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button onClick={() => {
                const badgeWin = window.open("", "_blank");
                if (badgeWin) {
                  badgeWin.document.write(`<html><head><title>Badge</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#1a0a2e;font-family:sans-serif;">
                    <div style="background:rgba(255,255,255,0.08);border:2px solid ${awardDetails.colorBg};border-radius:20px;padding:40px;text-align:center;box-shadow:0 0 40px ${awardDetails.colorBg}40;">
                      <img src="${awardDetails.medalImg}" style="width:130px;height:130px;object-fit:contain;margin-bottom:20px;" />
                      <h2 style="color:${awardDetails.colorBg};font-size:28px;margin:0 0 8px 0;">${awardDetails.title}</h2>
                      <p style="color:#f3e7be;margin:0 0 4px 0;">${userData.username}</p>
                      <p style="color:#94a3b8;margin:0;">${selectedCourse} — ${selectedLevel}</p>
                    </div>
                    <button onclick="window.print()" style="margin-top:20px;padding:12px 28px;background:#ec4899;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Print / Save Badge</button>
                  </body></html>`);
                  badgeWin.document.close();
                }
              }} style={{ ...btnStyle, margin: 0, background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                💾 Download / Save Badge
              </button>
              <button onClick={() => setViewState("result")} style={{ ...btnStyle, margin: 0, background: "linear-gradient(135deg, #475569, #334155)" }}>
                ← Back to Result
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}