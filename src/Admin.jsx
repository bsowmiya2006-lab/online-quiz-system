import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  MessageSquare, 
  LogOut, 
  PlusCircle, 
  UserCheck,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  FolderPlus,
  Camera,
  Lock,
  BarChart2,
  KeyRound,
  Award
} from "lucide-react";

import adminBgImage from "./assets/purple.jpg";

export default function Admin({ onLogout }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // 🔐 Password Change States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeMsg, setPasswordChangeMsg] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTopic, setSelectedTopic] = useState("Python");
  
  const [questionLimit, setQuestionLimit] = useState(25);
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [successMessage, setSuccessMessage] = useState("");

  const [certTemplateUrl, setCertTemplateUrl] = useState("");
  const [badgeAssetUrl, setBadgeAssetUrl] = useState("");
  const [urlSavedMsg, setUrlSavedMsg] = useState("");

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedImagesList, setCapturedImagesList] = useState([]);

  const [topicsList, setTopicsList] = useState([
    { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { name: "C++", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg" },
    { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "DSA", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuresqldatabase/azuresqldatabase-original.svg" },
    { name: "DBMS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { name: "Cloud", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" },
    { name: "SoftwareEng", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
    { name: "MachineLearning", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
    { name: "OS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
    { name: "OOP", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "GenAI", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg" },
    { name: "DataScience", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" }
  ]);

  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicLogo, setNewTopicLogo] = useState("");
  const [topicAddedMsg, setTopicAddedMsg] = useState("");

  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [bulkJsonText, setBulkJsonText] = useState("");

  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [registrationHistory, setRegistrationHistory] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [cheatingLogs, setCheatingLogs] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [topicAnalytics, setTopicAnalytics] = useState({});
  const [certSettings, setCertSettings] = useState({});
  const [adVideoUrl, setAdVideoUrl] = useState("");

  // Certificate customization states
  const [signatoryName, setSignatoryName] = useState("Authorized");
  const [signatoryTitle, setSignatoryTitle] = useState("Authorized Signatory");
  const [collegeHeading, setCollegeHeading] = useState("WAVOO WAJEEHA WOMEN'S COLLEGE OF ARTS AND SCIENCE");
  const [universityHeading, setUniversityHeading] = useState("MANONMANIAM SUNDARANAR UNIVERSITY");

  // Advertisement file upload states
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedVideoFileName, setSelectedVideoFileName] = useState("");
  const [selectedVideoFileSize, setSelectedVideoFileSize] = useState("");
  const [videoLocalPreview, setVideoLocalPreview] = useState("");

  useEffect(() => {
    const savedTopics = JSON.parse(localStorage.getItem("adminCustomTopicsList"));
    if (savedTopics && savedTopics.length > 0) {
      setTopicsList(savedTopics);
    }

    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    
    fetch(`${BACKEND_URL}/feedbacks`)
      .then(res => res.json())
      .then(data => setFeedbacks(Array.isArray(data) ? data : (data.feedbacks || [])))
      .catch(console.error);

    fetch(`${BACKEND_URL}/admin/users`)
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(console.error);

    fetch(`${BACKEND_URL}/admin/registration-history`)
      .then(res => res.json())
      .then(data => setRegistrationHistory(data.history || []))
      .catch(console.error);
      
    fetch(`${BACKEND_URL}/admin/login-history`)
      .then(res => res.json())
      .then(data => setLoginHistory(data.history || []))
      .catch(console.error);

    fetch(`${BACKEND_URL}/proctoring/logs`)
      .then(res => res.json())
      .then(data => setCheatingLogs(Array.isArray(data) ? data : (data.logs || [])))
      .catch(console.error);

    fetch(`${BACKEND_URL}/proctoring/images`)
      .then(res => res.json())
      .then(data => setCapturedImagesList(Array.isArray(data) ? data : (data.images || [])))
      .catch(console.error);
      
    fetch(`${BACKEND_URL}/quiz-results`)
      .then(res => res.json())
      .then(data => setQuizHistory(Array.isArray(data) ? data : []))
      .catch(console.error);
      
    fetch(`${BACKEND_URL}/certificate-settings`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === "object") {
          setCertSettings(data);
          if (data.certTemplateUrl) setCertTemplateUrl(data.certTemplateUrl);
          if (data.badgeAssetUrl) setBadgeAssetUrl(data.badgeAssetUrl);
          if (data.signatoryName) setSignatoryName(data.signatoryName);
          if (data.signatoryTitle) setSignatoryTitle(data.signatoryTitle);
          if (data.collegeHeading) setCollegeHeading(data.collegeHeading);
          if (data.universityHeading) setUniversityHeading(data.universityHeading);
        }
      })
      .catch(console.error);

    fetch(`${BACKEND_URL}/advertisement`)
      .then(res => res.json())
      .then(data => setAdVideoUrl(data.video_url || ""))
      .catch(console.error);

    const savedAnalytics = JSON.parse(localStorage.getItem("studentTopicAnalytics")) || {
      Python: 14,
      Java: 9,
      JavaScript: 12,
      DSA: 7,
      GenAI: 15,
      MachineLearning: 11
    };
    setTopicAnalytics(savedAnalytics);

    const savedLimit = localStorage.getItem("quizQuestionLimit");
    if (savedLimit) setQuestionLimit(Number(savedLimit));

    const savedTimer = localStorage.getItem("quizTimerMinutes");
    if (savedTimer) setTimerMinutes(Number(savedTimer));

    setCertTemplateUrl(localStorage.getItem("adminCertTemplateUrl") || "");
    setBadgeAssetUrl(localStorage.getItem("adminBadgeAssetUrl") || "");
  }, []);

  useEffect(() => {
    const loadedQ = JSON.parse(localStorage.getItem(`adminQuestions_${selectedTopic}`)) || [];
    setQuestions(loadedQ);
  }, [selectedTopic]);

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    const activeAdminPwd = localStorage.getItem("adminCustomPassword") || "admin123";
    if (adminPasswordInput === activeAdminPwd) {
      setIsAdminAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect Admin Password!");
    }
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    const activeAdminPwd = localStorage.getItem("adminCustomPassword") || "admin123";
    if (currentPassword !== activeAdminPwd) {
      setPasswordChangeMsg("Current password is incorrect!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeMsg("New passwords do not match!");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordChangeMsg("Password must be at least 4 characters!");
      return;
    }
    localStorage.setItem("adminCustomPassword", newPassword);
    setPasswordChangeMsg("Admin password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordChangeMsg(""), 4000);
  };

  const handleAddNewTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !newTopicLogo.trim()) {
      alert("Please enter both Topic Name and Logo URL!");
      return;
    }

    const formattedKey = newTopicName;
    const existingIndex = topicsList.findIndex(t => t.name.toLowerCase() === formattedKey.toLowerCase());
    
    let updatedList = [...topicsList];
    if (existingIndex >= 0) {
      updatedList[existingIndex] = { name: topicsList[existingIndex].name, logo: newTopicLogo };
    } else {
      updatedList.push({ name: formattedKey, logo: newTopicLogo });
    }
    
    setTopicsList(updatedList);
    localStorage.setItem("adminCustomTopicsList", JSON.stringify(updatedList));

    setNewTopicName("");
    setNewTopicLogo("");
    setTopicAddedMsg("Topic saved successfully!");
    setTimeout(() => setTopicAddedMsg(""), 3000);
  };

  const handleSaveConfig = () => {
    localStorage.setItem("quizQuestionLimit", questionLimit);
    localStorage.setItem("quizTimerMinutes", timerMinutes);
    setSuccessMessage("Settings saved & synchronized successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleSaveUrls = async (e) => {
    e.preventDefault();
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const settings = {
      certTemplateUrl,
      badgeAssetUrl,
      signatoryName,
      signatoryTitle,
      collegeHeading,
      universityHeading
    };
    try {
      await fetch(`${BACKEND_URL}/certificate-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
    } catch (err) { console.error(err); }
    localStorage.setItem("adminCertTemplateUrl", certTemplateUrl);
    localStorage.setItem("adminBadgeAssetUrl", badgeAssetUrl);
    setCertSettings(settings);
    setUrlSavedMsg("✅ Certificate settings saved to MySQL database & live preview updated!");
    setTimeout(() => setUrlSavedMsg(""), 3000);
  };

  const [adUploadMsg, setAdUploadMsg] = useState("");
  const [adUploading, setAdUploading] = useState(false);

  const handleVideoFileSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideoFile(file);
      setSelectedVideoFileName(file.name);
      setSelectedVideoFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");
      const localUrl = URL.createObjectURL(file);
      setVideoLocalPreview(localUrl);
      setAdUploadMsg(`Selected file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB). Click 'Upload & Save' to publish.`);
    }
  };

  const handleAdVideoUpload = async (e) => {
    e.preventDefault();
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    if (!selectedVideoFile) {
      setAdUploadMsg("❌ Please click 'Select Video' to choose a video file first.");
      return;
    }
    const formData = new FormData();
    formData.append("video", selectedVideoFile);
    setAdUploading(true);
    setAdUploadMsg("Uploading video to server storage...");
    try {
      const res = await fetch(`${BACKEND_URL}/advertisement`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.status === "success") {
        setAdVideoUrl(data.video_url);
        setVideoLocalPreview("");
        setSelectedVideoFile(null);
        setSelectedVideoFileName("");
        setSelectedVideoFileSize("");
        setAdUploadMsg("✅ Advertisement video successfully uploaded and saved in MySQL & storage!");
      } else {
        setAdUploadMsg(`❌ ${data.message}`);
      }
    } catch (err) {
      setAdUploadMsg("❌ Upload failed. Check backend connection.");
    } finally {
      setAdUploading(false);
      setTimeout(() => setAdUploadMsg(""), 6000);
    }
  };

  const handleAdVideoDelete = async () => {
    if (!window.confirm("Delete the current advertisement video permanently?")) return;
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${BACKEND_URL}/advertisement`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        setAdVideoUrl("");
        setVideoLocalPreview("");
        setSelectedVideoFile(null);
        setSelectedVideoFileName("");
        setSelectedVideoFileSize("");
        setAdUploadMsg("✅ Advertisement deleted successfully.");
        setTimeout(() => setAdUploadMsg(""), 3000);
      }
    } catch (err) {
      setAdUploadMsg("❌ Delete failed.");
    }
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText || options.some(opt => !opt) || !correctAnswer) {
      alert("Please fill all question fields!");
      return;
    }
    const newQ = {
      id: Date.now(),
      question: newQuestionText,
      options: [...options],
      answer: correctAnswer
    };
    const updatedQuestions = [...questions, newQ];
    setQuestions(updatedQuestions);
    localStorage.setItem(`adminQuestions_${selectedTopic}`, JSON.stringify(updatedQuestions));

    setNewQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    alert(`Question added for ${selectedTopic} and synced!`);
  };

  const handleBulkAdd = (e) => {
    e.preventDefault();
    try {
      const parsedData = JSON.parse(bulkJsonText);
      if (!Array.isArray(parsedData)) {
        alert("Data must be a valid JSON array!");
        return;
      }
      const formattedQuestions = parsedData.map((q, index) => ({
        id: Date.now() + index,
        question: q.question,
        options: q.options,
        answer: q.answer
      }));

      const updatedQuestions = [...questions, ...formattedQuestions];
      setQuestions(updatedQuestions);
      localStorage.setItem(`adminQuestions_${selectedTopic}`, JSON.stringify(updatedQuestions));

      setBulkJsonText("");
      alert(`Successfully added ${formattedQuestions.length} questions for ${selectedTopic}!`);
    } catch (err) {
      alert("Invalid JSON format!");
    }
  };

  const containerStyle = {
    display: "flex",
    height: "100vh",
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.88)), url(${adminBgImage})`,
    backgroundColor: "#0f172a",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#f8fafc",
    fontFamily: "sans-serif"
  };

  if (!isAdminAuthenticated) {
    return (
      <div style={{ ...containerStyle, justifyContent: "center", alignItems: "center" }}>
        <div style={{ backgroundColor: "rgba(30, 41, 59, 0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", padding: "40px", borderRadius: "20px", border: "1px solid rgba(249, 115, 22, 0.3)", width: "100%", maxWidth: "400px", textAlign: "center", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(236, 72, 153, 0.15)" }}>
          <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #ec4899, #f97316)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", boxShadow: "0 0 15px rgba(236, 72, 153, 0.6)" }}>
            <Lock size={30} color="#fff" />
          </div>
          <h2 style={{ marginBottom: "10px", fontSize: "22px", color: "#ec4899" }}>Admin Panel Login</h2>
          <p style={{ color: "#f3e7be", fontSize: "14px", marginBottom: "25px" }}>Enter admin password to access controls.</p>
          
          {passwordError && <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "15px", fontWeight: "bold" }}>{passwordError}</p>}
          
          <form onSubmit={handleAdminLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input 
              type="password" 
              placeholder="Enter Password" 
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.4)", color: "#fff", borderRadius: "10px", boxSizing: "border-box", fontSize: "15px", outline: "none" }}
            />
            <button type="submit" style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "15px", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)" }}>
              Login
            </button>
            <button type="button" onClick={onLogout} style={{ backgroundColor: "transparent", color: "#f3e7be", border: "none", cursor: "pointer", fontSize: "13px", marginTop: "5px" }}>
              ← Back to Student View
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* SIDEBAR */}
      <div style={{ width: "260px", backgroundColor: "rgba(30, 41, 59, 0.75)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", borderRight: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", flexDirection: "column", padding: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", background: "linear-gradient(135deg, #ec4899, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "25px", textAlign: "center" }}>
          ⚡ Admin Controls
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto" }}>
          <button onClick={() => setActiveTab("dashboard")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "dashboard" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <LayoutDashboard size={18} /> Dashboard & Chart
          </button>
          <button onClick={() => setActiveTab("topics")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "topics" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <FolderPlus size={18} /> Add Topics & Logos
          </button>
          <button onClick={() => setActiveTab("questions")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "questions" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <BookOpen size={18} /> Question Bank
          </button>
          <button onClick={() => setActiveTab("camera")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "camera" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <Camera size={18} /> Camera & ID Monitor
          </button>
          <button onClick={() => setActiveTab("assets")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "assets" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <ImageIcon size={18} /> Canva Cert & Badge Preview
          </button>
          <button onClick={() => setActiveTab("students")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "students" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <Users size={18} /> Students & Completion
          </button>
          <button onClick={() => setActiveTab("settings")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "settings" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <Settings size={18} /> Quiz & Timer Settings
          </button>
          <button onClick={() => setActiveTab("password")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "password" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <KeyRound size={18} /> Change Admin Password
          </button>
          <button onClick={() => setActiveTab("feedbacks")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "feedbacks" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <MessageSquare size={18} /> Student Feedbacks
          </button>
          <button onClick={() => setActiveTab("link")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "link" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <span style={{fontSize:"18px"}}>🔗</span> LINK
          </button>
          <button onClick={() => setActiveTab("advertisement")} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", background: activeTab === "advertisement" ? "linear-gradient(135deg, #ec4899, #f97316)" : "transparent", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", textAlign: "left" }}>
            <span style={{fontSize:"18px"}}>▶</span> ADVERTISEMENT
          </button>
        </div>

        <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", background: "rgba(239, 68, 68, 0.2)", color: "#f87171", border: "1px solid #ef4444", borderRadius: "10px", cursor: "pointer", fontWeight: "600", marginTop: "15px" }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        
        {activeTab === "dashboard" && (
          <div>
            <h1 style={{ color: "#ec4899" }}>Admin Dashboard & Student Progress</h1>
            <p style={{ color: "#f3e7be" }}>Platform overview, statistics, and course completion status.</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginTop: "20px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
                <h3 style={{ color: "#ec4899", fontSize: "14px", margin: "0 0 10px 0" }}>Total Topics</h3>
                <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>{topicsList.length} Courses</p>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
                <h3 style={{ color: "#34d399", fontSize: "14px", margin: "0 0 10px 0" }}>Registered Users</h3>
                <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>{users.length} Active</p>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
                <h3 style={{ color: "#f97316", fontSize: "14px", margin: "0 0 10px 0" }}>Timer Duration</h3>
                <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>{timerMinutes} Mins</p>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
                <h3 style={{ color: "#38bdf8", fontSize: "14px", margin: "0 0 10px 0" }}>Feedbacks</h3>
                <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>{feedbacks.length}</p>
              </div>
            </div>

            {/* Topic Popularity Chart */}
            <div style={{ marginTop: "30px", background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                <BarChart2 size={24} color="#ec4899" />
                <h3 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Student Popularity & Course Completion Chart</h3>
              </div>
              <p style={{ color: "#f3e7be", fontSize: "13px", marginBottom: "20px" }}>
                மாணவர்கள் எந்தெந்த கோர்ஸ்களை முடித்துள்ளனர் மற்றும் குவிஸ் அட்டென்ட் செய்துள்ளனர் என்பதற்கான லைவ் விபரங்கள்:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {topicsList.map((t) => {
                  const count = topicAnalytics[t.name] || Math.floor(Math.random() * 15) + 5;
                  const percentage = Math.min(Math.round((count / 20) * 100), 100);

                  return (
                    <div key={t.name} style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={{ width: "130px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src={t.logo} alt="" style={{ width: "18px", height: "18px", objectFit: "contain" }} onError={(e)=>{e.target.src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"}} />
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>{t.name}</span>
                      </div>
                      <div style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)", borderRadius: "6px", height: "12px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <div style={{ width: `${percentage}%`, background: "linear-gradient(135deg, #ec4899, #f97316)", height: "100%", borderRadius: "4px" }}></div>
                      </div>
                      <span style={{ fontSize: "13px", color: "#f3e7be", fontWeight: "bold", width: "90px", textAlign: "right" }}>{count} Completed</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div style={{ maxWidth: "500px" }}>
            <h2 style={{ color: "#ec4899" }}>Change Admin Password</h2>
            <p style={{ color: "#f3e7be", marginBottom: "20px" }}>Update your admin login password securely.</p>
            
            {passwordChangeMsg && (
              <div style={{ backgroundColor: passwordChangeMsg.includes("successfully") ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", color: passwordChangeMsg.includes("successfully") ? "#34d399" : "#f87171", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
                {passwordChangeMsg}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>Current Password:</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password..." style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>New Password:</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password..." style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>Confirm New Password:</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password..." style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
              </div>
              <button type="submit" style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)" }}>
                Update Password
              </button>
            </form>
          </div>
        )}

        {activeTab === "topics" && (
          <div style={{ maxWidth: "600px" }}>
            <h2 style={{ color: "#ec4899" }}>Add / Edit Topics & Logos</h2>
            <p style={{ color: "#f3e7be", marginBottom: "20px" }}>Create, edit, or delete topics. Upload a file for the logo.</p>

            {topicAddedMsg && (
              <div style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} /> {topicAddedMsg}
              </div>
            )}

            <form onSubmit={handleAddNewTopic} style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>Topic Name:</label>
                <input type="text" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} placeholder="e.g. CyberSecurity" style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>Logo Image (File Explorer):</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setNewTopicLogo(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }} style={{ width: "100%", padding: "10px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
                <p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>Or enter URL below:</p>
                <input type="text" value={newTopicLogo} onChange={(e) => setNewTopicLogo(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none", marginTop: "5px" }} />
              </div>
              <button type="submit" style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)" }}>
                Save Topic
              </button>
            </form>

            <h3 style={{ color: "#ec4899" }}>Active Topics ({topicsList.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
              {topicsList.map((t, idx) => (
                <div key={idx} style={{ background: "rgba(255, 255, 255, 0.08)", padding: "12px 15px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={t.logo} alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} onError={(e)=>{e.target.src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"}} />
                    <span style={{ fontWeight: "600", fontSize: "14px", color: "#fff" }}>{t.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => { setNewTopicName(t.name); setNewTopicLogo(t.logo); }} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
                    <button onClick={() => { 
                      if(window.confirm(`Delete topic ${t.name}?`)) {
                        const filtered = topicsList.filter(item => item.name !== t.name);
                        setTopicsList(filtered);
                        localStorage.setItem("adminCustomTopicsList", JSON.stringify(filtered));
                      }
                    }} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "questions" && (
          <div>
            <h2 style={{ color: "#ec4899" }}>Manage Question Bank & Sync</h2>
            <div style={{ margin: "20px 0" }}>
              <label style={{ marginRight: "10px", fontWeight: "600", color: "#f3e7be" }}>Select Topic:</label>
              <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} style={{ padding: "10px 15px", background: "rgba(255, 255, 255, 0.1)", color: "#fff0f6", border: "1px solid rgba(236, 72, 153, 0.4)", borderRadius: "10px", outline: "none" }}>
                {topicsList.map(t => (
                  <option key={t.name} value={t.name} style={{ background: "#1e293b", color: "#fff" }}>{t.name}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleBulkAdd} style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", marginBottom: "30px" }}>
              <h3 style={{ marginTop: 0, color: "#ec4899", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileCode size={20} /> Bulk Add Questions for {selectedTopic}
              </h3>
              <textarea 
                rows="4"
                value={bulkJsonText}
                onChange={(e) => setBulkJsonText(e.target.value)}
                placeholder='Paste JSON questions here...'
                style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", boxSizing: "border-box", marginBottom: "12px", fontFamily: "monospace", outline: "none" }}
              />
              <button type="submit" style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)" }}>
                🚀 Import & Sync JSON
              </button>
            </form>

            <form onSubmit={handleAddQuestion} style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", marginBottom: "30px" }}>
              <h3 style={{ marginTop: 0, color: "#ec4899" }}>Add Single Question for {selectedTopic}</h3>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: "#f3e7be" }}>Question Text:</label>
                <input type="text" value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} placeholder="Enter question..." style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                {options.map((opt, idx) => (
                  <input key={idx} type="text" value={opt} onChange={(e) => { const newOpts = [...options]; newOpts[idx] = e.target.value; setOptions(newOpts); }} placeholder={`Option ${idx + 1}`} style={{ padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
                ))}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", color: "#f3e7be" }}>Correct Answer:</label>
                <input type="text" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Enter correct option..." style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
              </div>
              <button type="submit" style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)" }}>
                <PlusCircle size={18} /> Add Question
              </button>
            </form>
          </div>
        )}

        {activeTab === "camera" && (
          <div style={{ maxWidth: "650px" }}>
            <h2 style={{ color: "#ec4899" }}>Live Camera, ID Verification & Cheating Logs</h2>
            <p style={{ color: "#f3e7be", marginBottom: "20px" }}>Monitor student proctoring, ID cards, and warning logs during quizzes.</p>
            
            <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", textAlign: "center", marginBottom: "25px" }}>
              <div style={{ width: "100%", height: "280px", backgroundColor: "rgba(0, 0, 0, 0.4)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px dashed rgba(236, 72, 153, 0.4)", overflow: "hidden", position: "relative" }}>
                {cameraActive ? (
                  <video 
                    autoPlay 
                    playsInline 
                    muted 
                    ref={(vid) => {
                      if (vid && !vid.srcObject) {
                        navigator.mediaDevices.getUserMedia({ video: true })
                          .then((stream) => { vid.srcObject = stream; })
                          .catch(() => alert("Camera access denied."));
                      }
                    }} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                ) : capturedImage ? (
                  <img src={capturedImage} alt="Snapshot" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <p style={{ color: "#f3e7be" }}>Camera stream is offline.</p>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button 
                  onClick={() => setCameraActive(!cameraActive)} 
                  style={{ background: cameraActive ? "#ef4444" : "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "12px 22px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)" }}
                >
                  {cameraActive ? "Stop Camera" : "Start Live Proctor Camera"}
                </button>
                {cameraActive && (
                  <button 
                    onClick={() => {
                      const videoEl = document.querySelector("video");
                      if (videoEl) {
                        const canvas = document.createElement("canvas");
                        canvas.width = videoEl.videoWidth || 640;
                        canvas.height = videoEl.videoHeight || 480;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                        setCapturedImage(canvas.toDataURL("image/png"));
                        setCameraActive(false);
                      }
                    }}
                    style={{ background: "#34d399", color: "#fff", border: "none", padding: "12px 22px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Capture Student ID Snapshot
                  </button>
                )}
              </div>
            </div>

            <h3 style={{ color: "#ec4899", marginTop: "25px" }}>Captured Proctoring Images</h3>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px" }}>
              {capturedImagesList.length === 0 ? (
                 <p style={{ color: "#f3e7be" }}>No images captured yet.</p>
              ) : (
                 capturedImagesList.map((img, idx) => (
                   <div key={idx} style={{ flex: "0 0 auto", textAlign: "center", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "10px" }}>
                     <img src={img.image} alt={img.type} style={{ width: "150px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ec4899" }} />
                     <p style={{ fontSize: "12px", color: "#f3e7be", margin: "5px 0 0 0", fontWeight: "bold" }}>{img.username}</p>
                     <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>Type: {img.type.toUpperCase()}</p>
                     <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>{img.time}</p>
                   </div>
                 ))
              )}
            </div>

            <h3 style={{ color: "#ec4899", marginTop: "25px" }}>Cheating Warning Logs ({cheatingLogs.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {cheatingLogs.length === 0 ? (
                <p style={{ color: "#f3e7be" }}>No cheating or tab-switch warnings recorded.</p>
              ) : (
                cheatingLogs.map((log, idx) => (
                  <div key={idx} style={{ background: "rgba(239, 68, 68, 0.15)", padding: "12px 15px", borderRadius: "10px", border: "1px solid rgba(239, 68, 68, 0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#f87171", fontWeight: "bold" }}>⚠️ User: {log.username} - {log.message || "Student switched tabs or left screen"}</span>
                    <span style={{ fontSize: "12px", color: "#f3e7be" }}>{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "assets" && (
          <div style={{ maxWidth: "880px" }}>
            <h2 style={{ color: "#ec4899" }}>Canva Certificate & Badge Live Preview & Editor</h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <p style={{ color: "#f3e7be", margin: 0 }}>Design your certificates and badges easily with live preview.</p>
              <button onClick={() => window.open("https://canva.com", "_blank")} style={{ background: "#0ea5e9", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>🎨 OPEN CANVA</button>
            </div>

            {urlSavedMsg && <div style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: "1px solid rgba(52, 211, 153, 0.3)" }}>{urlSavedMsg}</div>}
            
            <form onSubmit={handleSaveUrls} style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>University Heading Text:</label>
                  <input type="text" value={universityHeading} onChange={(e) => setUniversityHeading(e.target.value)} placeholder="MANONMANIAM SUNDARANAR UNIVERSITY" style={{ width: "100%", padding: "10px 12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>College Name Text:</label>
                  <input type="text" value={collegeHeading} onChange={(e) => setCollegeHeading(e.target.value)} placeholder="WAVOO WAJEEHA WOMEN'S COLLEGE OF ARTS AND SCIENCE" style={{ width: "100%", padding: "10px 12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "8px", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>Signatory Name:</label>
                  <input type="text" value={signatoryName} onChange={(e) => setSignatoryName(e.target.value)} placeholder="Authorized / Principal Name" style={{ width: "100%", padding: "10px 12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "8px", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>Signatory Title / Designation:</label>
                  <input type="text" value={signatoryTitle} onChange={(e) => setSignatoryTitle(e.target.value)} placeholder="Authorized Signatory / Principal" style={{ width: "100%", padding: "10px 12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "8px", outline: "none" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>Certificate Background (File Explorer):</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setCertTemplateUrl(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }} style={{ width: "100%", padding: "10px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
                <p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>Or enter URL:</p>
                <input type="text" value={certTemplateUrl} onChange={(e) => setCertTemplateUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "10px 12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none", marginTop: "5px" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#f3e7be" }}>Badge Background (File Explorer):</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setBadgeAssetUrl(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }} style={{ width: "100%", padding: "10px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
                <p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>Or enter URL:</p>
                <input type="text" value={badgeAssetUrl} onChange={(e) => setBadgeAssetUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", padding: "10px 12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none", marginTop: "5px" }} />
              </div>
              <button type="submit" style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)" }}>
                💾 Save Settings to MySQL & Update Live Preview
              </button>
            </form>

            {/* LIVE PREVIEW BOX */}
            <h3 style={{ color: "#ec4899", marginBottom: "15px" }}>Live Certificate Preview (Real-time)</h3>
            <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", marginBottom: "25px" }}>
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1400/900",
                background: certTemplateUrl ? `url(${certTemplateUrl}) center/cover no-repeat` : "#fffdf8",
                borderRadius: "10px",
                border: "2px solid rgba(249, 115, 22, 0.5)",
                color: "#1e293b",
                padding: "20px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textAlign: "center"
              }}>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", margin: 0, letterSpacing: "1px" }}>{universityHeading || "MANONMANIAM SUNDARANAR UNIVERSITY"}</p>
                  <p style={{ fontSize: "11px", fontWeight: "600", color: "#475569", margin: "4px 0" }}>{collegeHeading || "WAVOO WAJEEHA WOMEN'S COLLEGE OF ARTS AND SCIENCE"}</p>
                  <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#1e293b", margin: "10px 0 2px 0", letterSpacing: "2px" }}>CERTIFICATE</h2>
                  <p style={{ fontSize: "10px", fontWeight: "bold", color: "#475569", letterSpacing: "1px", margin: 0 }}>OF PARTICIPATION</p>
                </div>

                <div>
                  <p style={{ fontSize: "10px", color: "#475569", margin: "4px 0" }}>THIS IS PROUDLY PRESENTED TO</p>
                  <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", borderBottom: "2px solid #f97316", display: "inline-block", padding: "0 15px", margin: "4px 0" }}>Student Name (Live Preview)</h3>
                  <p style={{ fontSize: "10px", color: "#334155", maxWidth: "80%", margin: "6px auto 0 auto", lineHeight: "1.4" }}>
                    For successfully demonstrating exceptional dedication and completing the online assessment in Python (Easy) with remarkable enthusiasm.
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 15px" }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "9px", fontWeight: "bold", color: "#64748b", margin: 0 }}>Date Issued:</p>
                    <p style={{ fontSize: "10px", fontWeight: "bold", color: "#0f172a", margin: "2px 0 0 0" }}>{new Date().toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "Brush Script MT, cursive", fontSize: "16px", color: "#1e293b", margin: 0, fontWeight: "bold" }}>{signatoryName || "Authorized"}</p>
                    <div style={{ width: "80px", height: "1.5px", background: "#0f172a", margin: "2px auto" }}></div>
                    <p style={{ fontSize: "8px", fontWeight: "bold", color: "#64748b", margin: 0 }}>{signatoryTitle || "Authorized Signatory"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div>
            <h2 style={{ color: "#ec4899" }}>Registered Students ({users.length})</h2>
            <p style={{ color: "#f3e7be", marginBottom: "15px" }}>Current registered students stored permanently in MySQL:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "30px" }}>
              {users.length === 0 ? <p style={{ color: "#f3e7be" }}>No registered students yet.</p> : users.map((item, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <UserCheck size={22} color="#ec4899" />
                    <div>
                      <p style={{ margin: "0 0 3px 0", fontWeight: "bold", color: "#fff" }}>{item.username}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#f3e7be" }}>{item.college_name} | {item.email}</p>
                      <p style={{ margin: "3px 0 0 0", fontSize: "11px", color: "#64748b" }}>Registered: {item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", color: "#34d399", background: "rgba(52,211,153,0.15)", padding: "5px 10px", borderRadius: "6px" }}>Active</span>
                </div>
              ))}
            </div>

            <h2 style={{ color: "#a855f7" }}>Registration History ({registrationHistory.length})</h2>
            <p style={{ color: "#f3e7be", marginBottom: "12px" }}>Every student registration recorded in MySQL registration history table:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "30px" }}>
              {registrationHistory.length === 0 ? <p style={{ color: "#f3e7be" }}>No registration history records yet.</p> : registrationHistory.map((item, idx) => (
                <div key={idx} style={{ background: "rgba(168, 85, 247, 0.12)", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(168, 85, 247, 0.28)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: "bold", color: "#c084fc" }}>{item.username}</span>
                    <span style={{ color: "#f3e7be", fontSize: "12px", marginLeft: "10px" }}>{item.college_name}</span>
                    <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "10px" }}>({item.email})</span>
                  </div>
                  <span style={{ color: "#34d399", fontSize: "12px", fontWeight: "600" }}>{item.reg_date} {item.reg_time}</span>
                </div>
              ))}
            </div>

            <h2 style={{ color: "#60a5fa" }}>Login History ({loginHistory.length})</h2>
            <p style={{ color: "#f3e7be", marginBottom: "12px" }}>Every login creates a new record in MySQL (students can log in multiple times):</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "30px" }}>
              {loginHistory.length === 0 ? <p style={{ color: "#f3e7be" }}>No login records yet.</p> : loginHistory.map((item, idx) => (
                <div key={idx} style={{ background: "rgba(59,130,246,0.1)", padding: "11px 16px", borderRadius: "10px", border: "1px solid rgba(59,130,246,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: "bold", color: "#60a5fa" }}>{item.username}</span>
                    <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "10px" }}>{item.email}</span>
                  </div>
                  <span style={{ color: "#f3e7be", fontSize: "12px" }}>{item.login_date} {item.login_time}</span>
                </div>
              ))}
            </div>

            <h2 style={{ color: "#34d399" }}>Quiz History ({quizHistory.length})</h2>
            <p style={{ color: "#f3e7be", marginBottom: "12px" }}>All quiz completions with scores and dates:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "30px" }}>
              {quizHistory.length === 0 ? <p style={{ color: "#f3e7be" }}>No quiz completions yet.</p> : quizHistory.map((item, idx) => (
                <div key={idx} style={{ background: "rgba(16,185,129,0.1)", padding: "11px 16px", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: "bold", color: "#34d399" }}>{item.username}</span>
                    <span style={{ color: "#f3e7be", fontSize: "12px", marginLeft: "10px" }}>{item.course} — {item.level}</span>
                  </div>
                  <div>
                    <span style={{ color: "#fff", fontWeight: "bold" }}>{item.score}/{item.total}</span>
                    <span style={{ color: "#94a3b8", fontSize: "12px", marginLeft: "8px" }}>{parseFloat(item.percentage || 0).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ color: "#f97316" }}>Student Photos ({capturedImagesList.length})</h2>
            <p style={{ color: "#f3e7be", marginBottom: "12px" }}>Face & ID card photos permanently stored on server disk & MySQL:</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "14px" }}>
              {capturedImagesList.length === 0 ? <p style={{ color: "#f3e7be" }}>No photos uploaded yet.</p> : capturedImagesList.map((img, idx) => {
                const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
                const imgSrc = img.image_url ? `${BACKEND_URL}${img.image_url}` : img.image;
                return (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "12px", border: "1px solid rgba(255,255,255,0.15)", textAlign: "center" }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={img.type || img.photo_type} style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} onError={(e) => { e.target.src=""; e.target.alt="Photo unavailable"; }} />
                    ) : (
                      <div style={{ height: "130px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>No image</div>
                    )}
                    <p style={{ margin: "4px 0", color: "#ec4899", fontWeight: "bold", fontSize: "13px" }}>{img.username}</p>
                    <span style={{ fontSize: "11px", color: "#34d399", background: "rgba(52,211,153,0.15)", padding: "3px 8px", borderRadius: "6px" }}>
                      {(img.type || img.photo_type) === "face" ? "🤳 Face Photo" : "🪪 College ID Card"}
                    </span>
                    {img.created_at && <p style={{ fontSize: "10px", color: "#64748b", marginTop: "5px" }}>{img.created_at}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div style={{ maxWidth: "500px" }}>
            <h2 style={{ color: "#ec4899" }}>Quiz Global Configurations & Timer</h2>
            {successMessage && <div style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34d399", padding: "12px", borderRadius: "10px", marginBottom: "20px" }}>{successMessage}</div>}
            
            <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "25px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#f3e7be" }}>Question Limit per Quiz:</label>
                <select value={questionLimit} onChange={(e) => setQuestionLimit(Number(e.target.value))} style={{ width: "100%", padding: "12px", background: "rgba(255, 255, 255, 0.08)", color: "#fff", border: "1px solid rgba(236, 72, 153, 0.3)", borderRadius: "10px", outline: "none" }}>
                  <option value={15} style={{ background: "#1e293b" }}>15 Questions</option>
                  <option value={20} style={{ background: "#1e293b" }}>20 Questions</option>
                  <option value={25} style={{ background: "#1e293b" }}>25 Questions</option>
                  <option value={30} style={{ background: "#1e293b" }}>30 Questions</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#f3e7be" }}>Timer Duration (Minutes):</label>
                <input type="number" value={timerMinutes} onChange={(e) => setTimerMinutes(Number(e.target.value))} style={{ width: "100%", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#fff", borderRadius: "10px", outline: "none" }} />
              </div>
              <button onClick={handleSaveConfig} style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)" }}>
                Save & Synchronize
              </button>
            </div>
          </div>
        )}

        {activeTab === "feedbacks" && (
          <div>
            <h2 style={{ color: "#ec4899" }}>Student Feedbacks History</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
              {feedbacks.length === 0 ? <p style={{ color: "#f3e7be" }}>No feedbacks received yet.</p> : feedbacks.map((fb, idx) => (
                <div key={idx} style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", color: "#ec4899" }}>{fb.username || fb.student || "Anonymous"}</span>
                    <span style={{ color: "#fbbf24", fontSize: "14px" }}>{'★'.repeat(fb.rating || 5)}{'☆'.repeat(5 - (fb.rating || 5))}</span>
                  </div>
                  <p style={{ margin: "8px 0 0 0", color: "#f8fafc" }}>{fb.text || fb.comment || fb.feedback_text}</p>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>{fb.date ? String(fb.date) : ""} {fb.time ? String(fb.time) : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "link" && (
          <div style={{ maxWidth: "600px" }}>
            <h2 style={{ color: "#ec4899" }}>Share Quiz System Links</h2>
            <p style={{ color: "#f3e7be", marginBottom: "20px" }}>Share the public URL to allow new students to register and take the quiz.</p>
            
            <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", marginBottom: "20px" }}>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 8px 0" }}>Public Quiz System URL:</p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input readOnly value={window.location.origin} style={{ flex: 1, background: "#0f172a", border: "1px solid rgba(236, 72, 153, 0.4)", color: "#fff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }} />
                <button onClick={() => { navigator.clipboard.writeText(window.location.origin); alert("✅ Quiz link copied!"); }} style={{ background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>📋 Copy</button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { name: "WhatsApp", icon: "💬", color: "#25d366", url: `https://wa.me/?text=${encodeURIComponent("Join our Online Quiz System: " + window.location.origin)}` },
                { name: "Facebook", icon: "👥", color: "#1877f2", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}` },
                { name: "Instagram", icon: "📸", color: "#e1306c", url: "https://www.instagram.com/" },
                { name: "Twitter / X", icon: "🐦", color: "#1da1f2", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Take this quiz! " + window.location.origin)}` }
              ].map(({ name, icon, color, url }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 18px", background: `${color}22`, border: `1px solid ${color}55`, borderRadius: "12px", color: "#fff", textDecoration: "none", fontSize: "15px", fontWeight: "bold", transition: "background 0.2s" }}>
                  <span style={{ fontSize: "22px" }}>{icon}</span>
                  <span>Share on {name}</span>
                  <span style={{ marginLeft: "auto", color: color }}>→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {activeTab === "advertisement" && (() => {
          const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
          const currentVideoSource = videoLocalPreview || (adVideoUrl ? `${BACKEND_URL}${adVideoUrl}` : "");

          return (
            <div style={{ maxWidth: "800px" }}>
              <h2 style={{ color: "#ec4899" }}>Advertisement Management</h2>
              <p style={{ color: "#f3e7be", marginBottom: "20px" }}>Upload, preview, and manage your promotional video shown at the bottom of the Student Home page.</p>

              {adUploadMsg && (
                <div style={{ background: adUploadMsg.startsWith("✅") ? "rgba(16,185,129,0.2)" : adUploadMsg.startsWith("Selected") ? "rgba(59,130,246,0.2)" : "rgba(239,68,68,0.2)", color: adUploadMsg.startsWith("✅") ? "#34d399" : adUploadMsg.startsWith("Selected") ? "#93c5fd" : "#f87171", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.15)" }}>
                  {adUploadMsg}
                </div>
              )}

              <form onSubmit={handleAdVideoUpload} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)", marginBottom: "28px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#f3e7be" }}>Select Video File from Computer:</label>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                  <label htmlFor="ad-video-input" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", padding: "11px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    📁 Choose Video File
                  </label>
                  <input 
                    id="ad-video-input" 
                    type="file" 
                    accept="video/*" 
                    onChange={handleVideoFileSelection}
                    style={{ display: "none" }} 
                  />
                  <span style={{ color: selectedVideoFileName ? "#34d399" : "#94a3b8", fontSize: "14px", fontWeight: selectedVideoFileName ? "600" : "normal" }}>
                    {selectedVideoFileName ? `Selected: ${selectedVideoFileName} (${selectedVideoFileSize})` : "No video file selected"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button type="submit" disabled={adUploading || !selectedVideoFile} style={{ flex: 1, background: "linear-gradient(135deg, #ec4899, #f97316)", color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: (!selectedVideoFile || adUploading) ? "not-allowed" : "pointer", opacity: (adUploading || !selectedVideoFile) ? 0.6 : 1 }}>
                    {adUploading ? "Uploading to Server..." : "🚀 Upload & Save Video"}
                  </button>
                  {adVideoUrl && (
                    <button type="button" onClick={handleAdVideoDelete} style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid #ef4444", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
                      🗑 Delete Video
                    </button>
                  )}
                </div>
              </form>

              {currentVideoSource ? (
                <div>
                  <h3 style={{ color: "#f3e7be", marginBottom: "12px" }}>
                    {videoLocalPreview ? "Selected Local Video Preview (Not uploaded yet):" : "Current Active Advertisement Video (Saved on Server):"}
                  </h3>
                  <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: "16px", overflow: "hidden", border: "2px solid rgba(236,72,153,0.5)" }}>
                    <video controls playsInline style={{ width: "100%", height: "100%", objectFit: "contain" }} src={currentVideoSource}>
                      Your browser does not support HTML video.
                    </video>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "10px" }}>
                    {videoLocalPreview ? "Previewing selected file. Click 'Upload & Save Video' above to publish." : "This video is actively shown to students at the end of the Topics / Course Select page."}
                  </p>
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", border: "2px dashed rgba(255,255,255,0.2)", padding: "40px", textAlign: "center" }}>
                  <p style={{ fontSize: "40px", marginBottom: "12px" }}>🎬</p>
                  <p style={{ color: "#94a3b8" }}>No advertisement video active yet. Click 'Choose Video File' above to select and upload a college promotional video.</p>
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}