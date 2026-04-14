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
  if (!window.jspdf) {
    alert('PDF library could not load. Please check your internet connection and try again.');
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const marginX = 14;
    const contentWidth = 182;
    const top = 14;
    const bottom = 282;
    let y = top;

    const ensureSpace = (needed = 8) => {
      if (y + needed > bottom) {
        doc.addPage();
        y = top;
      }
    };

    const addSectionTitle = (title) => {
      ensureSpace(10);
      doc.setTextColor('#22d3ee');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(title.toUpperCase(), marginX, y);
      y += 2;
      doc.setDrawColor('#22d3ee');
      doc.line(marginX, y + 1, marginX + contentWidth, y + 1);
      y += 6;
      doc.setTextColor('#1e1e1e');
    };

    const addParagraph = (text, fontSize = 10.2, lineHeight = 5.2) => {
      doc.setTextColor('#1e1e1e');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, contentWidth);
      ensureSpace(lines.length * lineHeight + 2);
      doc.text(lines, marginX, y);
      y += lines.length * lineHeight;
    };

    const addBulletList = (items) => {
      doc.setTextColor('#1e1e1e');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      items.forEach((item) => {
        const bullet = `• ${item}`;
        const lines = doc.splitTextToSize(bullet, contentWidth - 2);
        ensureSpace(lines.length * 4.8 + 1);
        doc.text(lines, marginX + 2, y);
        y += lines.length * 4.8;
      });
    };

    // Header section
    doc.setTextColor('#070d1a');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MUHAMMAD HAMMAD TAHIR', marginX, y);
    y += 7;
    
    doc.setTextColor('#22d3ee');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.5);
    doc.text('Artificial Intelligence Student', marginX, y);
    y += 5;
    
    doc.setTextColor('#1e1e1e');
    doc.setFontSize(9.5);
    doc.text('Email: hammadtahirfdc@gmail.com | Phone: +92 321 2307601', marginX, y);
    y += 4;
    doc.text('Location: Karachi, Pakistan', marginX, y);
    y += 7;

    addSectionTitle('Professional Summary');
    addParagraph(
      'Motivated Artificial Intelligence student with hands-on experience in Deep Learning, Computer Vision and Natural Language Processing. Skilled in Python and modern AI frameworks, with practical experience building CNN and NLP models. Passionate about solving real-world problems through applied AI and continuous learning.'
    );
    y += 3;

    addSectionTitle('Education');
    doc.setTextColor('#070d1a');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DHA Suffa University, Karachi, Pakistan', marginX, y);
    y += 4.5;
    doc.setTextColor('#1e1e1e');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Bachelor of Science in Artificial Intelligence | Oct 2023 - Present', marginX, y);
    y += 4.5;
    addBulletList([
      'Focused on Machine Learning, Deep Learning, Computer Vision and NLP.',
      'Built learning projects involving CNN architectures and text models.'
    ]);
    y += 1;

    doc.setTextColor('#070d1a');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    ensureSpace(10);
    doc.text('Fazaia Degree College, Karachi, Pakistan', marginX, y);
    y += 4.5;
    doc.setTextColor('#1e1e1e');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Pre-Engineering (FSc) | Apr 2021 - May 2022', marginX, y);
    y += 6;

    addSectionTitle('Core Skills');
    addBulletList([
      'Python Programming, App Development, Machine Learning Fundamentals',
      'Deep Learning, Computer Vision, Natural Language Processing',
      'Problem Solving, Teamwork, Leadership, Adaptability'
    ]);
    y += 3;

    addSectionTitle('Projects');
    doc.setTextColor('#070d1a');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.8);
    ensureSpace(8);
    doc.text('CNN for Image Classification (Learning Project)', marginX, y);
    y += 4.5;
    addBulletList([
      'Studied core CNN concepts including convolution, pooling and activations.',
      'Implemented a basic model for multi-class image classification.',
      'Trained and evaluated the model using Python deep learning libraries.'
    ]);
    y += 1;

    doc.setTextColor('#070d1a');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.8);
    ensureSpace(8);
    doc.text('NLP Text Classification (Practice Work)', marginX, y);
    y += 4.5;
    addBulletList([
      'Explored NLP approaches with LSTM and transformer-based models.',
      'Built a sentiment classification model on a small dataset.',
      'Performed preprocessing including tokenization, padding and embeddings.'
    ]);

    doc.addPage();
    y = top;
    doc.setTextColor('#1e1e1e');

    addSectionTitle('Additional Projects');
    addBulletList([
      'Birthday Finder and Online Examination System (Java)',
      'Basic Calculator (GUI) - Python',
      'AI Voice Assistant - Python',
      'AI Chatbot',
      'Rock Paper Scissors Game',
      'Quiz Game',
      'E-Commerce Website'
    ]);
    y += 3;

    addSectionTitle('Achievements');
    addBulletList([
      'Best Behaviour Certificate',
      'Best Handwriting Certificate',
      'Hour of Code Certificate (Coding Game)',
      'Cleared MIT Hackathon in a fast-paced innovation environment',
      'Participated in ISCT 2025 Conference on current AI and computing trends'
    ]);
    y += 3;

    addSectionTitle('Languages');
    addBulletList(['English', 'Urdu', 'Punjabi']);
    y += 3;

    addSectionTitle('Soft Skills');
    addBulletList([
      'Teamwork',
      'Problem-Solving',
      'Leadership',
      'Adaptability',
      'Critical Thinking',
      'Creativity',
      'Negotiation',
      'Management'
    ]);

    ensureSpace(16);
    y += 6;
    doc.setTextColor('#969696');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('Professional portfolio-generated CV | Updated: April 2026', marginX, y);

    doc.save('Muhammad-Hammad-Tahir-CV.pdf');
  } catch (error) {
    console.error('CV generation error:', error);
    alert('CV download failed. Please try again.');
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
