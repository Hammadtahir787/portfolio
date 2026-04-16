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
const viewCvBtn = document.getElementById('view-cv');
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

function loadImageDataUrl(src) {
  return fetch(src)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load image: ${src}`);
      }

      return response.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}

function loadCircularImageDataUrl(src, size = 320) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      const scale = Math.max(size / image.width, size / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const offsetX = (size - drawWidth) / 2;
      const offsetY = (size - drawHeight) / 2;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    };

    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

async function createCvPdf(action = 'download') {
  try {
    const cvFileName = 'Muhammad-Hammad-Tahir-CV-Teal-2026.pdf';

    // Check if jsPDF library is available
    if (!window.jspdf || !window.jspdf.jsPDF) {
      // Fallback: open a mailto link with CV content
      const subject = encodeURIComponent('My CV - Muhammad Hammad Tahir');
      const body = encodeURIComponent(`MUHAMMAD HAMMAD TAHIR
Artificial Intelligence Student | Python Developer

CONTACT
Phone: +92 321 2307601
Email: hammadtahirfdc@gmail.com
Location: Karachi, Pakistan
GitHub: github.com/Hammadtahir787
LinkedIn: linkedin.com/in/hammad-tahir-a45519319

SUMMARY
AI student with practical experience in Deep Learning, Computer Vision, NLP, and Python-based development.

EDUCATION
DHA Suffa University, Karachi
BS in Artificial Intelligence | Oct 2023 - Present

Fazaia Degree College, Karachi
Pre-Engineering, FSc | Apr 2021 - May 2022

SKILLS
Python, Machine Learning, Deep Learning, Computer Vision, NLP, App Development

PROJECTS
- CNN for Image Classification
- NLP Text Classification
- AI Voice Assistant, AI Chatbot, Calculator GUI, E-Commerce Website

ACHIEVEMENTS
- Best Behaviour Certificate
- Best Handwriting Certificate
- Hour of Code Certificate
- MIT Hackathon Participant
- ISCT 2025 Conference Attendee`);
      if (action === 'view') {
        alert('Preview is unavailable right now. Please use Download CV.');
        return;
      }

      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      return;
    }

    const jsPDF_func = window.jspdf.jsPDF;
    const doc = new jsPDF_func({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 8;
    const headerHeight = 42;
    const sidebarWidth = 58;
    const sidebarX = margin;
    const contentX = margin + sidebarWidth + 8;
    const contentWidth = pageWidth - contentX - margin;
    const sidebarInnerWidth = sidebarWidth - 2;
    const bodyTop = headerHeight + 6;

    const colors = {
      bg: [238, 240, 241],
      tealDark: [0, 65, 68],
      teal: [0, 109, 111],
      ink: [20, 38, 40],
      gray: [233, 247, 247],
      muted: [84, 104, 106],
      line: [170, 183, 184],
      white: [255, 255, 255],
    };

    function setColor(color) {
      doc.setTextColor(color[0], color[1], color[2]);
    }

    function addWrappedText(text, x, y, width, options = {}) {
      const fontSize = options.fontSize ?? 9;
      const fontStyle = options.fontStyle ?? 'normal';
      const lineGap = options.lineGap ?? 4.4;
      const textColor = options.textColor ?? colors.ink;

      doc.setFont('helvetica', fontStyle);
      doc.setFontSize(fontSize);
      setColor(textColor);

      const lines = doc.splitTextToSize(text, width);
      doc.text(lines, x, y);
      return y + lines.length * lineGap;
    }

    function addBulletItems(items, x, y, width, options = {}) {
      const fontSize = options.fontSize ?? 8.6;
      const bulletGap = options.bulletGap ?? 1.6;
      const textColor = options.textColor ?? colors.ink;

      items.forEach((item) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fontSize);
        setColor(textColor);
        doc.text('•', x, y);
        y = addWrappedText(item, x + 3.8, y, width - 3.8, {
          fontSize,
          lineGap: options.lineGap ?? 4.2,
          textColor,
        });
        y += bulletGap;
      });

      return y;
    }

    function addSidebarSection(title, y) {
      doc.setFillColor(colors.teal[0], colors.teal[1], colors.teal[2]);
      doc.roundedRect(sidebarX, y - 3.6, sidebarInnerWidth, 8.2, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      setColor(colors.white);
      doc.text(title, sidebarX + 5, y + 1.8);
      return y + 8.8;
    }

    function addContentSection(title, y) {
      const pillWidth = Math.min(78, contentWidth - 4);
      doc.setFillColor(colors.tealDark[0], colors.tealDark[1], colors.tealDark[2]);
      doc.roundedRect(contentX, y - 3.6, pillWidth, 8.2, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      setColor(colors.white);
      doc.text(title, contentX + 5, y + 1.8);
      return y + 8.8;
    }

    function addExperienceEntry(role, org, dateRange, bullets, y) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      setColor(colors.ink);
      doc.text(role, contentX, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.1);
      setColor(colors.muted);
      doc.text(`${org} | ${dateRange}`, contentX, y);
      y += 4.3;

      y = addBulletItems(bullets, contentX, y, contentWidth - 2, {
        fontSize: 8.6,
        lineGap: 4.0,
        bulletGap: 1.2,
      });

      return y + 2;
    }

    async function addProfilePhoto() {
      try {
        const imgData = await loadCircularImageDataUrl('assets/profile.png');
        const photoSize = 30;
        const photoX = 16;
        const photoY = 9;
        doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
        doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 2.5, 'F');
        doc.addImage(imgData, 'PNG', photoX, photoY, photoSize, photoSize);
        doc.setDrawColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.setLineWidth(1.2);
        doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 2.5, 'S');
      } catch (error) {
        doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
        doc.circle(31, 24, 17, 'F');
        doc.setDrawColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.setLineWidth(1.2);
        doc.circle(31, 24, 17, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        setColor(colors.muted);
        doc.text('MHT', 24, 26);
      }
    }

    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(colors.tealDark[0], colors.tealDark[1], colors.tealDark[2]);
    doc.rect(0, 0, 68, pageHeight, 'F');
    doc.rect(68, 0, pageWidth - 68, headerHeight, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16.5);
    setColor(colors.white);
    doc.text('Muhammad Hammad Tahir*', 72, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.text('Motivated AI student with experience in Deep Learning,', 72, 28);
    doc.text('Computer Vision, and NLP. Skilled in Python and AI', 72, 32);
    doc.text('frameworks with hands-on CNN and NLP projects.', 72, 36);
    doc.text('Passionate about real-world AI applications and learning.', 72, 40);

    await addProfilePhoto();

    doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
    doc.rect(68, headerHeight, pageWidth - 68, pageHeight - headerHeight, 'F');
    doc.setDrawColor(colors.line[0], colors.line[1], colors.line[2]);
    doc.setLineWidth(0.4);
    doc.line(margin + sidebarWidth + 4, bodyTop - 2, margin + sidebarWidth + 4, pageHeight - margin);

    let leftY = bodyTop;
    let rightY = bodyTop;

    leftY = addSidebarSection('Contact', leftY);
    leftY = addWrappedText('Phone: +92 321 2307601', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, lineGap: 4.0, textColor: colors.gray });
    leftY = addWrappedText('Email: hammadtahirfdc@gmail.com', sidebarX, leftY + 1, sidebarInnerWidth, { fontSize: 8.0, lineGap: 4.0, textColor: colors.gray });
    leftY = addWrappedText('Karachi, Pakistan', sidebarX, leftY + 1, sidebarInnerWidth, { fontSize: 8.0, lineGap: 4.0, textColor: colors.gray });

    leftY += 2;
    leftY = addSidebarSection('Education', leftY);
    leftY = addWrappedText('DHA Suffa University', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.8, fontStyle: 'bold', lineGap: 4.0 });
    leftY = addWrappedText('Karachi, Pakistan', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, textColor: colors.gray, lineGap: 4.0 });
    leftY = addWrappedText('B.S. in Artificial Intelligence', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, lineGap: 4.0 });
    leftY = addWrappedText('2023 - Present', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.0, textColor: colors.gray, lineGap: 4.0 });
    leftY = addBulletItems(
      [
        'Studied ML, DL, CV, and NLP with practical CNN and NLP projects.',
        'Built a strong theory and practical skills foundation.',
      ],
      sidebarX,
      leftY + 1,
      sidebarInnerWidth,
      { fontSize: 7.8, lineGap: 3.7, bulletGap: 0.7, textColor: colors.gray }
    );

    leftY += 2;
    leftY = addWrappedText('Fazaia Degree College', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.8, fontStyle: 'bold', lineGap: 4.0 });
    leftY = addWrappedText('Karachi, Pakistan', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, textColor: colors.gray, lineGap: 4.0 });
    leftY = addWrappedText('Pre-Engineering, FSc', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, lineGap: 4.0 });
    leftY = addWrappedText('Apr 2021 - May 2022', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.0, textColor: colors.gray, lineGap: 4.0 });
    leftY = addBulletItems(
      [
        'Focused on Mathematics and Physics.',
        'Developed strong analytical and problem-solving skills.',
        'Built foundation for Artificial Intelligence studies.',
      ],
      sidebarX,
      leftY + 1,
      sidebarInnerWidth,
      { fontSize: 7.8, lineGap: 3.7, bulletGap: 0.7, textColor: colors.gray }
    );

    leftY += 2;
    leftY = addSidebarSection('Achievements', leftY);
    leftY = addBulletItems(
      ['Best Behaviour Certificate', 'Best Handwriting Certificate', 'Hour of Code Certificate (Coding Game)'],
      sidebarX,
      leftY,
      sidebarInnerWidth,
      { fontSize: 8.0, lineGap: 3.85, bulletGap: 0.6, textColor: colors.gray }
    );

    leftY += 2;
    leftY = addBulletItems(
      [
        'Cleared MIT Hackathon, showcasing fast-paced problem-solving and innovation skills; and participated in ISICT 2025 Conference, gaining exposure to current research trends in AI and computing.',
      ],
      sidebarX,
      leftY,
      sidebarInnerWidth,
      { fontSize: 8.0, lineGap: 3.85, bulletGap: 0.6, textColor: colors.gray }
    );

    leftY += 2;
    leftY = addSidebarSection('Soft Skills', leftY);
    leftY = addWrappedText(
      'Teamwork, Problem-Solving, Leadership, Adaptability, Critical Thinking, Creativity, Negotiation, Management',
      sidebarX,
      leftY,
      sidebarInnerWidth,
      { fontSize: 8.0, lineGap: 3.95, textColor: colors.gray }
    );

    rightY = addContentSection('Summary', rightY);
    rightY = addWrappedText(
      'Motivated Artificial Intelligence student with practical experience in Deep Learning, Computer Vision, NLP, and Python-based development. Comfortable turning academic concepts into real projects and eager to contribute in internships or entry-level AI roles.',
      contentX,
      rightY,
      contentWidth,
      { fontSize: 9.1, lineGap: 4.2, textColor: colors.ink }
    );

    rightY += 3;
    rightY = addContentSection('Projects', rightY);
    rightY = addWrappedText('CNN for Image Classification (Learning Project)', contentX, rightY, contentWidth, {
      fontSize: 9.2,
      fontStyle: 'bold',
      lineGap: 4.0,
      textColor: colors.ink,
    });
    rightY = addBulletItems(
      [
        'Studied CNN fundamentals (convolution, pooling, activation functions).',
        'Built a basic CNN model for multi-class image classification.',
        'Used Python and deep learning libraries for training and evaluation.',
      ],
      contentX,
      rightY,
      contentWidth,
      { fontSize: 8.3, lineGap: 3.8, bulletGap: 0.9, textColor: colors.ink }
    );

    rightY += 1;
    rightY = addWrappedText('NLP Text Classification (Practical Work)', contentX, rightY, contentWidth, {
      fontSize: 9.2,
      fontStyle: 'bold',
      lineGap: 4.0,
      textColor: colors.ink,
    });
    rightY = addBulletItems(
      [
        'Explored NLP techniques using LSTM and transformer models.',
        'Built a sentiment classification model on a small text dataset.',
        'Performed text preprocessing (tokenization, padding, embeddings).',
      ],
      contentX,
      rightY,
      contentWidth,
      { fontSize: 8.3, lineGap: 3.8, bulletGap: 0.9, textColor: colors.ink }
    );

    rightY += 2;
    rightY = addContentSection('Other Projects', rightY);
    rightY = addWrappedText(
      'Birthday Finder & Online Examination System (Java)\nBasic Calculator GUI (Python)\nAI Voice Assistant, AI Chatbot\nRock Paper Scissors Game\nQuiz Game\nE-Commerce Website',
      contentX,
      rightY,
      contentWidth,
      { fontSize: 8.5, lineGap: 4.1, textColor: colors.ink }
    );

    rightY += 2;
    rightY = addContentSection('Skills', rightY);
    rightY = addWrappedText(
      'Python Programming (Advanced)\nDeep Learning\nComputer Vision\nApp Development\nNatural Language Processing\nMachine Learning Fundamentals',
      contentX,
      rightY,
      contentWidth,
      { fontSize: 8.6, lineGap: 4.2, textColor: colors.ink }
    );

    if (action === 'view') {
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const previewWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

      if (!previewWindow) {
        alert('Please allow pop-ups to preview CV.');
      } else {
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      }

      return;
    }

    doc.save(cvFileName);
  } catch (e) {
    console.error('PDF Error:', e);
    alert('Download failed. Please retry or contact me directly.');
  }
}

if (downloadCvBtn) {
  downloadCvBtn.addEventListener('click', () => {
    void createCvPdf('download');
  });
}

if (viewCvBtn) {
  viewCvBtn.addEventListener('click', () => {
    void createCvPdf('view');
  });
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
