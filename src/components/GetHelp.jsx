import React, { useState } from 'react';
import { MessageCircle, X, ChevronLeft, ChevronRight, Key, UserPlus, ShieldAlert } from 'lucide-react';
import '../styles/GetHelp.css';

function GetHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null); // null, 'login', 'register', 'facial'
  const [activeQuestion, setActiveQuestion] = useState(null); // null or question index

  const toggleHelp = () => {
    setIsOpen(!isOpen);
    setActiveCategory(null);
    setActiveQuestion(null);
  };

  const categories = [
    {
      id: 'login',
      title: 'Login Issues',
      icon: <Key size={16} />,
      questions: [
        {
          q: 'Face unlock is not recognized?',
          a: 'Make sure you are under good lighting and your camera lens is clean. If it still fails, you can switch to Email/Password login.'
        },
        {
          q: 'How to switch to Email/Password login?',
          a: 'Click the "Use Email/Password" link button at the bottom of the face scanner.'
        },
        {
          q: 'Can I log in without a registered face?',
          a: 'No, you must register your face first to use the face recognition system, or use the registered credentials.'
        },
        {
          q: 'Login fails with "Face doesn\'t match"?',
          a: 'Position your face directly in front of the camera, remove glasses or hats, and ensure your entire face is visible.'
        },
        {
          q: 'How do I know if my face is registered?',
          a: 'Try logging in, or register again if you get a persistent mismatch error.'
        }
      ]
    },
    {
      id: 'register',
      title: 'Registration Issues',
      icon: <UserPlus size={16} />,
      questions: [
        {
          q: 'How to complete a Face Scan for registration?',
          a: 'Keep your head steady in the center of the camera frame. The camera will automatically detect your face.'
        },
        {
          q: 'Why is the "Capture & Register" button disabled?',
          a: 'It enables only after the system successfully detects a face in the camera frame.'
        },
        {
          q: 'Can I register multiple email accounts with the same face?',
          a: 'Each face registration should be associated with a unique email address to ensure accurate identification.'
        },
        {
          q: 'What fields are required to register?',
          a: 'First Name, Last Name, Email address, and a successful face scan.'
        },
        {
          q: 'I get a registration error, what should I do?',
          a: 'Check your internet/server connection and ensure your email is valid.'
        }
      ]
    },
    {
      id: 'facial',
      title: 'Facial Issues',
      icon: <ShieldAlert size={16} />,
      questions: [
        {
          q: 'Camera access is denied, how to enable it?',
          a: 'Click the camera icon in your browser address bar and grant permission to access your webcam.'
        },
        {
          q: 'Does it work in low light?',
          a: 'Low light can affect recognition accuracy. Please use the app in a well-lit environment.'
        },
        {
          q: 'Can a photo be used to bypass security?',
          a: 'Our system uses advanced descriptors that analyze facial landmarks to prevent bypasses, though real-time physical presence is optimal.'
        },
        {
          q: 'Models failed to load error?',
          a: 'Please refresh the page. If it continues, check if your internet is working to load the local assets.'
        },
        {
          q: 'What if my camera is not working at all?',
          a: 'Click the "Camera Not Working" link on the navigation menu for troubleshooting guides.'
        }
      ]
    }
  ];

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveQuestion(null);
  };

  const handleQuestionClick = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const handleBack = () => {
    if (activeQuestion !== null) {
      setActiveQuestion(null);
    } else {
      setActiveCategory(null);
    }
  };

  const currentCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div className="get-help-container">
      {/* Floating Button (Smaller size per user request) */}
      <button className="help-button-small" onClick={toggleHelp} title="Get Help">
        <MessageCircle size={18} />
      </button>

      {/* Help Panel (White/Light theme, fully responsive) */}
      {isOpen && (
        <div className="help-panel-light">
          <div className="help-header-light">
            <div className="help-header-left">
              {activeCategory && (
                <button className="back-btn" onClick={handleBack} title="Go Back">
                  <ChevronLeft size={16} />
                </button>
              )}
              <h3>{currentCategoryData ? currentCategoryData.title : 'Get Help'}</h3>
            </div>
            <button className="close-btn-light" onClick={toggleHelp} title="Close">
              <X size={16} />
            </button>
          </div>

          <div className="help-content-light">
            {!activeCategory ? (
              // Category Selection (Options Type)
              <div className="category-options">
                <p className="help-subtitle-light">Select an option to find solutions:</p>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className="category-option-btn"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-title">{category.title}</span>
                    <ChevronRight size={14} className="arrow-icon" />
                  </button>
                ))}
              </div>
            ) : (
              // Question Options Selection
              <div className="question-options">
                {currentCategoryData.questions.map((item, index) => (
                  <div key={index} className="question-item-container">
                    <button
                      className={`question-option-btn ${activeQuestion === index ? 'active' : ''}`}
                      onClick={() => handleQuestionClick(index)}
                    >
                      <span className="question-text">{item.q}</span>
                      <ChevronRight size={14} className={`arrow-icon ${activeQuestion === index ? 'rotate-90' : ''}`} />
                    </button>
                    {activeQuestion === index && (
                      <div className="answer-box">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GetHelp;
