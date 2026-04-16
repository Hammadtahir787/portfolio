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

async function createCvPdf(action = 'download') {
  try {
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
    const margin = 12;
    const headerHeight = 40;
    const sidebarWidth = 54;
    const sidebarX = margin;
    const contentX = margin + sidebarWidth + 8;
    const contentWidth = pageWidth - contentX - margin;
    const sidebarInnerWidth = sidebarWidth - 2;
    const bodyTop = headerHeight + 10;

    const colors = {
      black: [0, 0, 0],
      ink: [30, 30, 30],
      gray: [108, 108, 108],
      line: [175, 175, 175],
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
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.8);
      setColor(colors.ink);
      doc.text(title, sidebarX, y);
      y += 5;
      doc.setDrawColor(colors.line[0], colors.line[1], colors.line[2]);
      doc.setLineWidth(0.35);
      doc.line(sidebarX, y, sidebarX + sidebarInnerWidth, y);
      return y + 5;
    }

    function addContentSection(title, y) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      setColor(colors.ink);
      doc.text(title, contentX, y);
      y += 4.5;
      doc.setDrawColor(colors.line[0], colors.line[1], colors.line[2]);
      doc.setLineWidth(0.35);
      doc.line(contentX, y, contentX + contentWidth, y);
      return y + 5;
    }

    function addExperienceEntry(role, org, dateRange, bullets, y) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      setColor(colors.ink);
      doc.text(role, contentX, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.1);
      setColor(colors.gray);
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
        const imgData = await loadImageDataUrl('assets/profile.png');
        const photoSize = 26;
        const photoX = pageWidth - margin - photoSize;
        const photoY = 7;
        doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
        doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 1.6, 'F');
        doc.addImage(imgData, 'PNG', photoX, photoY, photoSize, photoSize);
        doc.setDrawColor(colors.line[0], colors.line[1], colors.line[2]);
        doc.setLineWidth(0.6);
        doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 1.6, 'S');
      } catch (error) {
        doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
        doc.circle(pageWidth - margin - 13, 20, 14, 'F');
        doc.setDrawColor(colors.line[0], colors.line[1], colors.line[2]);
        doc.circle(pageWidth - margin - 13, 20, 14, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        setColor(colors.gray);
        doc.text('MHT', pageWidth - margin - 19, 22);
      }
    }

    doc.setFillColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    setColor(colors.white);
    doc.text('MUHAMMAD HAMMAD TAHIR', margin, 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.6);
    doc.setDrawColor(130, 130, 130);
    doc.setLineWidth(0.7);
    doc.line(margin, 24.5, pageWidth - 48, 24.5);
    doc.text('Artificial Intelligence Student | Python Developer', margin, 30.5);

    await addProfilePhoto();

    doc.setDrawColor(colors.line[0], colors.line[1], colors.line[2]);
    doc.setLineWidth(0.45);
    doc.line(margin + sidebarWidth + 4, bodyTop - 2, margin + sidebarWidth + 4, pageHeight - margin);

    let leftY = bodyTop;
    let rightY = bodyTop;

    leftY = addSidebarSection('Contact', leftY);
    leftY = addWrappedText('Phone: +92 321 2307601', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.7, lineGap: 4.1, textColor: colors.gray });
    leftY = addWrappedText('Email: hammadtahirfdc@gmail.com', sidebarX, leftY + 1, sidebarInnerWidth, { fontSize: 8.7, lineGap: 4.1, textColor: colors.gray });
    leftY = addWrappedText('Karachi, Pakistan', sidebarX, leftY + 1, sidebarInnerWidth, { fontSize: 8.7, lineGap: 4.1, textColor: colors.gray });
    leftY = addWrappedText('GitHub: github.com/Hammadtahir787', sidebarX, leftY + 1, sidebarInnerWidth, { fontSize: 8.2, lineGap: 4.0, textColor: colors.gray });
    leftY = addWrappedText('LinkedIn: linkedin.com/in/hammad-tahir-a45519319', sidebarX, leftY + 1, sidebarInnerWidth, { fontSize: 8.0, lineGap: 4.0, textColor: colors.gray });

    leftY += 2;
    leftY = addSidebarSection('Skills', leftY);
    leftY = addBulletItems(
      [
        'Python Programming',
        'Machine Learning',
        'Deep Learning',
        'Computer Vision',
        'Natural Language Processing',
        'App Development',
        'Problem Solving',
        'Teamwork',
      ],
      sidebarX,
      leftY,
      sidebarInnerWidth,
      { fontSize: 8.2, lineGap: 3.9, bulletGap: 0.8, textColor: colors.gray }
    );

    leftY += 2;
    leftY = addSidebarSection('Education', leftY);
    leftY = addWrappedText('DHA Suffa University', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.8, fontStyle: 'bold', lineGap: 4.0 });
    leftY = addWrappedText('Karachi, Pakistan', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, textColor: colors.gray, lineGap: 4.0 });
    leftY = addWrappedText('B.S. in Artificial Intelligence', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, lineGap: 4.0 });
    leftY = addWrappedText('2023 - Present', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.0, textColor: colors.gray, lineGap: 4.0 });

    leftY += 2;
    leftY = addWrappedText('Fazaia Degree College', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.8, fontStyle: 'bold', lineGap: 4.0 });
    leftY = addWrappedText('Karachi, Pakistan', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, textColor: colors.gray, lineGap: 4.0 });
    leftY = addWrappedText('Pre-Engineering, FSc', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, lineGap: 4.0 });
    leftY = addWrappedText('2021 - 2022', sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.0, textColor: colors.gray, lineGap: 4.0 });

    leftY += 2;
    leftY = addSidebarSection('Languages', leftY);
    leftY = addBulletItems(['English - Advanced', 'Urdu - Native', 'Punjabi - Intermediate'], sidebarX, leftY, sidebarInnerWidth, { fontSize: 8.2, lineGap: 3.9, bulletGap: 0.6, textColor: colors.gray });

    leftY += 2;
    leftY = addSidebarSection('Achievements', leftY);
    leftY = addBulletItems(
      ['Best Behaviour Certificate', 'Best Handwriting Certificate', 'Hour of Code Certificate', 'MIT Hackathon Participant', 'ISCT 2025 Conference Attendee'],
      sidebarX,
      leftY,
      sidebarInnerWidth,
      { fontSize: 8.0, lineGap: 3.85, bulletGap: 0.6, textColor: colors.gray }
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
    rightY = addContentSection('Experience', rightY);

    rightY = addExperienceEntry(
      'AI Project Developer',
      'Academic & Personal Projects',
      '2023 - Present',
      [
        'Built a CNN-based image classification project using Python and deep learning libraries.',
        'Developed an NLP text classification model with preprocessing, tokenization, padding, and embeddings.',
        'Created supporting projects including an AI voice assistant, chatbot, calculator GUI, and e-commerce website.',
      ],
      rightY
    );

    rightY = addExperienceEntry(
      'AI Student',
      'DHA Suffa University',
      'Oct 2023 - Present',
      [
        'Studying Machine Learning, Deep Learning, Computer Vision, and NLP as part of the B.S. in Artificial Intelligence curriculum.',
        'Applying course concepts through hands-on assignments and portfolio projects.',
        'Building a strong foundation in problem solving, teamwork, and technical communication.',
      ],
      rightY
    );

    rightY = addContentSection('Selected Projects', rightY);
    rightY = addBulletItems(
      [
        'CNN for Image Classification - learned convolution, pooling, activations, training, and evaluation.',
        'NLP Text Classification - sentiment classification using LSTM and transformer-based approaches.',
        'Other Build Projects - Birthday Finder, Online Examination System, AI Voice Assistant, AI Chatbot, Quiz Game, and more.',
      ],
      contentX,
      rightY,
      contentWidth,
      { fontSize: 8.6, lineGap: 4.0, bulletGap: 1.1, textColor: colors.ink }
    );

    rightY += 2.5;
    rightY = addContentSection('Career Objective', rightY);
    rightY = addWrappedText(
      'Open to internships and junior AI roles in Machine Learning, Deep Learning, Computer Vision, and NLP.',
      contentX,
      rightY,
      contentWidth,
      { fontSize: 9.1, lineGap: 4.2, textColor: colors.ink }
    );

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.3);
    setColor(colors.gray);
    doc.text('Template style updated to match the requested two-column resume layout.', contentX, pageHeight - 12);

    if (action === 'view') {
      const blobUrl = doc.output('bloburl');
      const previewWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');

      if (!previewWindow) {
        alert('Please allow pop-ups to preview CV.');
      }

      return;
    }

    doc.save('Muhammad-Hammad-Tahir-CV-Template.pdf');
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
