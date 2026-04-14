const revealNodes = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);

revealNodes.forEach((node, index) => {
  node.style.transitionDelay = `${index * 60}ms`;
  observer.observe(node);
});

const downloadCvBtn = document.getElementById('download-cv');
const contactModal = document.getElementById('contact-modal');
const openContactModalBtn = document.getElementById('open-contact-modal');
const closeContactModalBtn = document.getElementById('close-contact-modal');
const contactBackdrop = document.getElementById('contact-backdrop');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const contactToast = document.getElementById('contact-toast');
const heroSuccessBanner = document.getElementById('hero-success-banner');
const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
const submitButtonText = contactForm ? contactForm.querySelector('.submit-btn-text') : null;
let contactSuccessTimer = null;
let heroBannerTimer = null;

function setSubmitState(state) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = state === 'loading';
  submitButton.classList.toggle('is-loading', state === 'loading');
  submitButton.classList.toggle('is-success', state === 'success');

  if (submitButtonText) {
    if (state === 'loading') {
      submitButtonText.textContent = 'Sending...';
    } else if (state === 'success') {
      submitButtonText.textContent = 'Sent';
    } else {
      submitButtonText.textContent = 'Submit';
    }
  }
}

function showContactToast(message, type = 'success') {
  if (!contactToast) {
    return;
  }

  contactToast.textContent = message;
  contactToast.classList.remove('success', 'error', 'show');
  contactToast.classList.add(type, 'show');

  window.clearTimeout(showContactToast.hideTimer);
  showContactToast.hideTimer = window.setTimeout(() => {
    contactToast.classList.remove('show');
  }, 2800);
}

function showHeroSuccessBanner(message, durationMs = 4500) {
  if (!heroSuccessBanner) {
    return;
  }

  heroSuccessBanner.textContent = message;
  heroSuccessBanner.classList.add('show');

  window.clearTimeout(heroBannerTimer);
  heroBannerTimer = window.setTimeout(() => {
    heroSuccessBanner.classList.remove('show');
  }, durationMs);
}

function createCvPdf() {
  try {
    // Check if jsPDF library is available
    if (!window.jspdf || !window.jspdf.jsPDF) {
      // Fallback: open a mailto link with CV content
      const subject = encodeURIComponent('My CV - Muhammad Hammad Tahir');
      const body = encodeURIComponent(`MUHAMMAD HAMMAD TAHIR
Artificial Intelligence Student | Python Developer

CONTACT INFORMATION
Email: hammadtahirfdc@gmail.com
Phone: +92 321 2307601
Location: Karachi, Pakistan
GitHub: https://github.com/Hammadtahir787
LinkedIn: https://www.linkedin.com/in/hammad-tahir-a45519319

PROFESSIONAL SUMMARY
Motivated Artificial Intelligence student with hands-on experience in Deep Learning, Computer Vision, and Natural Language Processing. Skilled in Python and modern AI frameworks, with practical experience building CNN and NLP-based models. Passionate about applying AI to real-world problems and continuously learning advanced technologies.

EDUCATION
DHA Suffa University, Karachi, Pakistan
Bachelor of Science in Artificial Intelligence | Oct 2023 - Present
Focus on Machine Learning, Deep Learning, Computer Vision, and NLP. Completed multiple learning projects involving CNNs and NLP models.

Fazaia Degree College, Karachi, Pakistan
Pre-Engineering, FSc | Apr 2021 - May 2022
Strong foundation in Mathematics and Physics with analytical and problem-solving skills.

CORE TECHNICAL SKILLS
• Python Programming (80%) - Advanced
• Machine Learning Fundamentals (80%) - Advanced
• App Development (80%) - Advanced
• Deep Learning (60%) - Intermediate
• Computer Vision (60%) - Intermediate
• Natural Language Processing (60%) - Intermediate

LANGUAGES
• English - Advanced
• Urdu - Native
• Punjabi - Intermediate

SOFT SKILLS
• Teamwork & Collaboration
• Problem-Solving & Critical Thinking
• Leadership & Adaptability
• Creativity & Innovation
• Negotiation & Communication
• Project Management

KEY PROJECTS
1. CNN for Image Classification
   - Studied core CNN concepts: convolution, pooling, and activations
   - Implemented a basic CNN model for multi-class image classification
   - Trained and evaluated using Python and deep learning libraries

2. NLP Text Classification
   - Explored NLP techniques using LSTM and transformer-based approaches
   - Built a sentiment classification model on a text dataset
   - Performed preprocessing including tokenization, padding, and embeddings

3. Other Build Projects
   - Birthday Finder | Online Examination System (Java)
   - Basic Calculator GUI (Python) | AI Voice Assistant (Python)
   - AI Chatbot | Rock Paper Scissors Game | Quiz Game | E-Commerce Website

ACHIEVEMENTS & CERTIFICATIONS
• Best Behaviour Certificate
• Best Handwriting Certificate
• Hour of Code Certificate (Coding Game)
• MIT Hackathon Participant - Competed in a fast-paced problem-solving environment
• ISCT 2025 Conference Attendee - Gained exposure to current research trends in AI and computing

CAREER OBJECTIVES
Open to internships and junior AI roles in Machine Learning, Deep Learning, Computer Vision, and NLP domains.`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      return;
    }
    
    // Create comprehensive PDF
    const jsPDF_func = window.jspdf.jsPDF;
    const doc = new jsPDF_func({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yPosition = margin;
    const lineHeight = 5;
    const sectionSpacing = 3;
    
    // Helper function to write text with wrapping
    function writeWrapped(text, size, isBold, startY) {
      doc.setFontSize(size);
      if (isBold) doc.setFont(undefined, 'bold');
      else doc.setFont(undefined, 'normal');
      
      const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(splitText, margin, startY);
      return startY + (splitText.length * lineHeight) + 2;
    }
    
    function writeSection(title, startY) {
      doc.setDrawColor(0, 180, 210);
      doc.setLineWidth(0.5);
      doc.line(margin, startY - 1, pageWidth - margin, startY - 1);
      yPosition = writeWrapped(title, 12, true, startY);
      return yPosition;
    }
    
    // Header
    yPosition = writeWrapped('MUHAMMAD HAMMAD TAHIR', 16, true, yPosition);
    yPosition = writeWrapped('Artificial Intelligence Student | Python Developer', 10, false, yPosition);
    yPosition += sectionSpacing;
    
    // Contact
    yPosition = writeWrapped('Email: hammadtahirfdc@gmail.com | Phone: +92 321 2307601 | Location: Karachi, Pakistan', 8, false, yPosition);
    yPosition = writeWrapped('GitHub: github.com/Hammadtahir787 | LinkedIn: linkedin.com/in/hammad-tahir-a45519319', 8, false, yPosition);
    yPosition += sectionSpacing;
    
    // Summary
    yPosition = writeSection('PROFESSIONAL SUMMARY', yPosition);
    yPosition = writeWrapped('Motivated AI student with hands-on experience in Deep Learning, Computer Vision, and NLP. Skilled in Python and modern AI frameworks with practical experience building CNN and NLP models. Passionate about applying AI to real-world problems.', 9, false, yPosition);
    yPosition += sectionSpacing;
    
    // Education
    yPosition = writeSection('EDUCATION', yPosition);
    yPosition = writeWrapped('DHA Suffa University, Karachi, Pakistan', 10, true, yPosition);
    yPosition = writeWrapped('Bachelor of Science in Artificial Intelligence | Oct 2023 - Present', 9, false, yPosition);
    yPosition = writeWrapped('Focus on ML, Deep Learning, Computer Vision, and NLP with multiple completed projects.', 8, false, yPosition);
    yPosition += 2;
    
    yPosition = writeWrapped('Fazaia Degree College, Karachi, Pakistan', 10, true, yPosition);
    yPosition = writeWrapped('Pre-Engineering, FSc | Apr 2021 - May 2022', 9, false, yPosition);
    yPosition = writeWrapped('Strong foundation in Mathematics and Physics.', 8, false, yPosition);
    yPosition += sectionSpacing;
    
    // Skills
    yPosition = writeSection('CORE SKILLS', yPosition);
    yPosition = writeWrapped('Python Programming (80%) • Deep Learning (60%) • Computer Vision (60%) • NLP (60%) • App Development (80%) • Machine Learning Fundamentals (80%)', 9, false, yPosition);
    yPosition += sectionSpacing;
    
    // Languages & Soft Skills
    yPosition = writeSection('LANGUAGES & SOFT SKILLS', yPosition);
    yPosition = writeWrapped('Languages: English (Advanced) • Urdu (Native) • Punjabi (Intermediate)', 9, false, yPosition);
    yPosition = writeWrapped('Soft Skills: Teamwork • Problem-Solving • Leadership • Creativity • Critical Thinking • Adaptability • Management', 9, false, yPosition);
    yPosition += sectionSpacing;
    
    // Projects
    yPosition = writeSection('KEY PROJECTS', yPosition);
    
    yPosition = writeWrapped('1. CNN for Image Classification', 10, true, yPosition);
    yPosition = writeWrapped('Implemented CNN model for multi-class image classification. Studied convolution, pooling, and activations using Python.', 9, false, yPosition);
    yPosition += 2;
    
    yPosition = writeWrapped('2. NLP Text Classification', 10, true, yPosition);
    yPosition = writeWrapped('Built sentiment classification model using LSTM and transformer approaches with preprocessing (tokenization, padding, embeddings).', 9, false, yPosition);
    yPosition += 2;
    
    yPosition = writeWrapped('3. Other Build Projects', 10, true, yPosition);
    yPosition = writeWrapped('Birthday Finder, Online Exam System (Java), Calculator GUI (Python), AI Voice Assistant, AI Chatbot, Games (Rock Paper Scissors, Quiz), E-Commerce Website.', 9, false, yPosition);
    yPosition += sectionSpacing;
    
    // Achievements
    if (yPosition > 240) {
      doc.addPage();
      yPosition = margin;
    }
    
    yPosition = writeSection('ACHIEVEMENTS', yPosition);
    yPosition = writeWrapped('• Best Behaviour Certificate', 9, false, yPosition);
    yPosition = writeWrapped('• Best Handwriting Certificate', 9, false, yPosition);
    yPosition = writeWrapped('• Hour of Code Certificate (Coding Game)', 9, false, yPosition);
    yPosition = writeWrapped('• MIT Hackathon Participant - Fast-paced problem-solving competition', 9, false, yPosition);
    yPosition = writeWrapped('• ISCT 2025 Conference Attendee - Current research trends in AI and computing', 9, false, yPosition);
    yPosition += sectionSpacing;
    
    // Career Objectives
    yPosition = writeSection('CAREER OBJECTIVES', yPosition);
    yPosition = writeWrapped('Open to internships and junior AI roles in Machine Learning, Deep Learning, Computer Vision, and NLP.', 9, false, yPosition);
    
    // Save PDF
    doc.save('Muhammad-Hammad-Tahir-CV.pdf');
  } catch (e) {
    console.error('PDF Error:', e);
    alert('Download failed. Please retry or contact me directly.');
  }
}

if (downloadCvBtn) {
  downloadCvBtn.addEventListener('click', createCvPdf);
}

function openContactModal() {
  if (!contactModal) {
    return;
  }
  window.clearTimeout(contactSuccessTimer);
  contactModal.classList.add('open');
  contactModal.setAttribute('aria-hidden', 'false');
  if (formStatus) {
    formStatus.textContent = '';
    formStatus.classList.remove('ok', 'error');
  }
  if (contactToast) {
    contactToast.classList.remove('show');
  }
  setSubmitState('idle');
}

function closeContactModal() {
  if (!contactModal) {
    return;
  }
  window.clearTimeout(contactSuccessTimer);
  contactModal.classList.remove('open');
  contactModal.setAttribute('aria-hidden', 'true');
}

if (openContactModalBtn) {
  openContactModalBtn.addEventListener('click', openContactModal);
}

if (closeContactModalBtn) {
  closeContactModalBtn.addEventListener('click', closeContactModal);
}

if (contactBackdrop) {
  contactBackdrop.addEventListener('click', closeContactModal);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeContactModal();
  }
});

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const subject = String(formData.get('subject') || 'Portfolio Inquiry').trim();
    const message = String(formData.get('message') || '').trim();
    const hiddenSubjectField = contactForm.querySelector('input[name="_subject"]');

    if (formStatus) {
      formStatus.textContent = 'Sending...';
      formStatus.classList.remove('ok', 'error');
    }

    setSubmitState('loading');

    try {
      if (hiddenSubjectField) {
        hiddenSubjectField.value = `Portfolio Contact: ${subject}`;
      }

      contactForm.setAttribute('action', 'https://formsubmit.co/hammadtahirfdc@gmail.com');
      contactForm.setAttribute('method', 'POST');
      contactForm.setAttribute('target', 'contact-submit-frame');

      if (formStatus) {
        formStatus.textContent = 'Submitting your message...';
        formStatus.classList.remove('ok', 'error');
      }

      showContactToast('Sending your message...', 'success');

      contactForm.submit();

      setSubmitState('success');

      if (formStatus) {
        formStatus.textContent = 'Message sent. If this is your first submission, check your inbox for a confirmation email.';
        formStatus.classList.add('ok');
      }

      showContactToast('Message sent successfully. Check your inbox for any confirmation email.', 'success');
      showHeroSuccessBanner('Message sent successfully. I will get back to you soon.', 5000);

      contactForm.reset();
      contactSuccessTimer = window.setTimeout(() => {
        closeContactModal();
        setSubmitState('idle');
      }, 2000);
    } catch (error) {
      const fallbackBody = [
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone || 'Not provided'}`,
        '',
        'Message:',
        message
      ].join('\n');

      if (formStatus) {
        formStatus.textContent = 'Form send failed. Opening email draft instead.';
        formStatus.classList.add('error');
      }

      showContactToast('Send failed, so an email draft was opened instead.', 'error');
      window.location.href = `mailto:hammadtahirfdc@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fallbackBody)}`;
      setSubmitState('idle');
    }
  });
}
