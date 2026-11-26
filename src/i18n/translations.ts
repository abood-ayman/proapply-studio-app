import type { AppLanguage } from '../types';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  nav: {
    cvBuilder: string;
    idMerger: string;
    certBundle: string;
    coverAndAudit: string;
    profileManager: string;
  };
  topbar: {
    langSwitch: string;
    installApp: string;
    installAppShort: string;
    offlineBanner: string;
    saveProfile: string;
    loadSample: string;
    clearBlank: string;
  };
  cv: {
    heading: string;
    subheading: string;
    modeInstant: string;
    modeAi: string;
    instantModeDesc: string;
    jobAdTitle: string;
    jobAdPlaceholder: string;
    tailorWithAi: string;
    tailoring: string;
    downloadPdf: string;
    loadSample: string;
    clearBlank: string;
    englishOnlyNotice: string;
    previewTitle: string;
    singlePageFit: string;
    densityLabel: string;
    pageWord: string;
    ofWord: string;
    zoomIn: string;
    zoomOut: string;
    zoomFit: string;
    renderingPdf: string;
    renderError: string;
    retryRender: string;
    sections: {
      personal: string;
      summary: string;
      skills: string;
      experience: string;
      education: string;
      certificates: string;
    };
    fields: {
      fullName: string;
      targetRole: string;
      location: string;
      phone: string;
      email: string;
      linkedin: string;
      summary: string;
      skillsHint: string;
      role: string;
      company: string;
      period: string;
      bulletsHint: string;
      degree: string;
      institution: string;
      graduation: string;
      certificatesHint: string;
      addExperience: string;
      removeExperience: string;
    };
  };
  idMerger: {
    heading: string;
    subheading: string;
    frontSlot: string;
    backSlot: string;
    uploadPrompt: string;
    rotateCcw: string;
    rotateCw: string;
    swapCards: string;
    enhanceToggle: string;
    enhanceDescription: string;
    clearSlot: string;
    zeroTextNote: string;
    a4PreviewTitle: string;
    generatePdf: string;
    emptyPreview: string;
    dimensionsLabel: string;
  };
  certBundle: {
    heading: string;
    subheading: string;
    uploadButton: string;
    uploadHint: string;
    layoutLabel: string;
    perPage1: string;
    perPage2: string;
    perPage4: string;
    exportPdf: string;
    clearAll: string;
    emptyTitle: string;
    emptySubtitle: string;
    pagePreviewTitle: string;
    moveUp: string;
    moveDown: string;
    rotateCcw: string;
    rotateCw: string;
    remove: string;
    pageCountLabel: string;
  };
  coverAndAudit: {
    heading: string;
    subheading: string;
    tabCoverLetter: string;
    tabFormChecker: string;
    cover: {
      companyLabel: string;
      companyPlaceholder: string;
      jobTitleLabel: string;
      jobTitlePlaceholder: string;
      jobDescLabel: string;
      jobDescPlaceholder: string;
      generateButton: string;
      templateButton: string;
      templateNote: string;
      profileMissingNote: string;
      generating: string;
      subjectLabel: string;
      bodyLabel: string;
      copyButton: string;
      downloadTxt: string;
      downloadPdf: string;
      emptyTitle: string;
      emptySubtitle: string;
    };
    reviewer: {
      inputLabel: string;
      inputPlaceholder: string;
      loadSample: string;
      clearInput: string;
      auditButton: string;
      offlineAuditButton: string;
      offlineDone: string;
      auditing: string;
      resultsTitle: string;
      emptyTitle: string;
      emptySubtitle: string;
      criticalLabel: string;
      warningLabel: string;
      okLabel: string;
      answerLabel: string;
      recommendationLabel: string;
      portalLabel: string;
    };
  };
  profileManager: {
    heading: string;
    subheading: string;
    profileStatusTitle: string;
    loadSampleBtn: string;
    clearBlankBtn: string;
    exportJsonBtn: string;
    importJsonBtn: string;
    quickExportsTitle: string;
    downloadCv: string;
    downloadId: string;
    downloadCerts: string;
    downloadBundle: string;
    goToIdMerger: string;
    goToCertBundle: string;
    pwaTitle: string;
    pwaSubtitle: string;
    androidTitle: string;
    androidSteps: string;
    iosTitle: string;
    iosSteps: string;
    desktopTitle: string;
    desktopSteps: string;
    emptyProfileStatus: string;
    activeProfileStatus: string;
  };
  toasts: {
    profileSaved: string;
    sampleLoaded: string;
    profileCleared: string;
    cvTailored: string;
    cvPdfGenerated: string;
    idPdfGenerated: string;
    certsPdfGenerated: string;
    coverLetterGenerated: string;
    coverLetterCopied: string;
    coverLetterPdfGenerated: string;
    cardsSwapped: string;
    bundleDownloaded: string;
    backupExported: string;
    backupImported: string;
    missingJobAd: string;
    missingFormText: string;
    missingIdCards: string;
    missingCerts: string;
  };
  pwa: {
    iosTitle: string;
    iosSteps: string;
    desktopTitle: string;
    desktopSteps: string;
    close: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  en: {
    appName: 'ProApply Studio',
    appSubtitle: 'Career Preparation & Document Suite',
    nav: {
      cvBuilder: 'CV Builder',
      idMerger: 'ID Merger',
      certBundle: 'Certificates PDF',
      coverAndAudit: 'Cover & Audit',
      profileManager: 'Profile & Backup',
    },
    topbar: {
      langSwitch: 'العربية',
      installApp: 'Install App',
      installAppShort: 'Install',
      offlineBanner: 'Offline Mode — PDF, ID, and Certificate tools remain available locally.',
      saveProfile: 'Save Profile',
      loadSample: 'Load Sample Data',
      clearBlank: 'Clear / Start Blank',
    },
    cv: {
      heading: 'Instant English CV Builder',
      subheading: 'Build an Instant ATS Template CV and export it on 1 single A4 page. AI tailoring is turned off for now.',
      modeInstant: 'Instant Template Mode',
      modeAi: 'AI Job-Tailored Mode (turned off)',
      instantModeDesc: 'Zero API wait — renders your single-page ATS English CV directly from your profile fields below.',
      jobAdTitle: 'Target Job Description (Arabic or English)',
      jobAdPlaceholder: 'Paste the full job description or requirements here...',
      tailorWithAi: 'AI tailoring (turned off)',
      tailoring: 'Tailoring CV...',
      downloadPdf: 'Export 1-Page PDF',
      loadSample: 'Load Sample Data',
      clearBlank: 'Clear / Start Blank',
      englishOnlyNotice: 'Generated CVs are output strictly in corporate ATS English.',
      previewTitle: 'Live A4 PDF Preview',
      singlePageFit: '1-Page A4 Guaranteed',
      densityLabel: 'Auto-Scale',
      pageWord: 'Page',
      ofWord: 'of',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      zoomFit: 'Fit',
      renderingPdf: 'Updating PDF...',
      renderError: 'Unable to render PDF preview.',
      retryRender: 'Retry',
      sections: {
        personal: 'Personal Details',
        summary: 'Professional Summary',
        skills: 'Core Competencies',
        experience: 'Work Experience',
        education: 'Education',
        certificates: 'Certifications & Training',
      },
      fields: {
        fullName: 'Full Name',
        targetRole: 'Target Job Title',
        location: 'Location',
        phone: 'Phone Number',
        email: 'Email Address',
        linkedin: 'LinkedIn URL',
        summary: 'Executive Summary',
        skillsHint: 'Comma-separated skills (e.g. Data Entry, SQL, Python)',
        role: 'Job Title',
        company: 'Organization / Project',
        period: 'Dates / Period',
        bulletsHint: 'One achievement or responsibility per line',
        degree: 'Degree / Major',
        institution: 'Institution',
        graduation: 'Expected Graduation',
        certificatesHint: 'One certificate per line',
        addExperience: 'Add Experience',
        removeExperience: 'Remove',
      },
    },
    idMerger: {
      heading: 'National ID Card Merger',
      subheading: 'Upload Front and Back photos from your device gallery/files to merge onto 1 pure-white A4 page.',
      frontSlot: 'Front Side (الوجه الأمامي)',
      backSlot: 'Back Side (الوجه الخلفي)',
      uploadPrompt: 'Choose Image File / Gallery',
      rotateCcw: 'Rotate 90° CCW',
      rotateCw: 'Rotate 90° CW',
      swapCards: 'Swap Front & Back',
      enhanceToggle: 'Contrast / Clarity Boost',
      enhanceDescription: 'Sharpens text and barcode edges directly in the HTML5 Canvas pixel buffer.',
      clearSlot: 'Clear',
      zeroTextNote: 'Exports National_ID_Merged.pdf on 1 pure-white A4 page with zero extra titles, labels, or watermarks.',
      a4PreviewTitle: 'Strict 1-Page A4 Preview',
      generatePdf: 'Export National_ID_Merged.pdf',
      emptyPreview: 'Upload both Front and Back ID images to preview the exact A4 placement.',
      dimensionsLabel: 'Canvas Buffer',
    },
    certBundle: {
      heading: 'Certificates & Documents PDF Bundle',
      subheading: 'Upload certificate or document images, rotate individually, choose 1, 2, or 4 per A4 page, and export.',
      uploadButton: 'Add Images from Files / Gallery',
      uploadHint: 'Supports multiple PNG, JPG, or WebP scans at once.',
      layoutLabel: 'Items per A4 Page',
      perPage1: '1 per page',
      perPage2: '2 per page',
      perPage4: '4 per page',
      exportPdf: 'Export Certificates_Portfolio.pdf',
      clearAll: 'Clear All',
      emptyTitle: 'No Documents Added Yet',
      emptySubtitle: 'Select certificate or official document images from your device to arrange and export as a clean multi-page A4 PDF.',
      pagePreviewTitle: 'A4 Page Layout Preview',
      moveUp: 'Move earlier',
      moveDown: 'Move later',
      rotateCcw: '90° CCW',
      rotateCw: '90° CW',
      remove: 'Remove',
      pageCountLabel: 'Total Pages',
    },
    coverAndAudit: {
      heading: 'Cover Letter & Form Checker (offline, no AI)',
      subheading: 'Build a cover letter and check form answers offline. AI features stay off in this public build; nothing you type is sent anywhere.',
      tabCoverLetter: 'Cover Letter Generator',
      tabFormChecker: 'Application Form Reviewer',
      cover: {
        companyLabel: 'Target Organization (Optional)',
        companyPlaceholder: 'e.g. Example Co, Sample Org',
        jobTitleLabel: 'Job Title (Optional)',
        jobTitlePlaceholder: 'e.g. Data Entry Specialist',
        jobDescLabel: 'Target Job Description',
        jobDescPlaceholder: 'Paste the job posting or role responsibilities here...',
        generateButton: 'Generate Cover Letter (AI off)',
        templateButton: 'Build from my profile (no AI)',
        templateNote: 'Built only from the details you entered in the CV Builder tab. Fully editable before export.',
        profileMissingNote: 'Fill in your details in the CV Builder tab first, then build the letter.',
        generating: 'Drafting Letter...',
        subjectLabel: 'Email / Application Subject',
        bodyLabel: 'Editable Cover Letter (English)',
        copyButton: 'Copy Text',
        downloadTxt: 'Download .TXT',
        downloadPdf: 'Download PDF',
        emptyTitle: 'Build your cover letter',
        emptySubtitle: 'The AI drafter is turned off in this public build, but you can build a letter from your profile, then edit and export it. Nothing you type here is sent anywhere.',
      },
      reviewer: {
        inputLabel: 'Application Final Review Text',
        inputPlaceholder: 'Paste all questions and your selected answers from UN/FAO, Oracle Taleo, Workday, or Google Forms...',
        loadSample: 'Load Sample Review',
        clearInput: 'Clear Text',
        auditButton: 'Form audit (AI turned off)',
        offlineAuditButton: 'Check answers (no AI)',
        offlineDone: 'Review ready. Check the findings before you submit.',
        auditing: 'Auditing Answers...',
        resultsTitle: 'Audit Findings',
        emptyTitle: 'Check your form answers',
        emptySubtitle: 'The AI auditor is turned off in this public build, but the offline checker flags risky or blank answers. Nothing you type here is sent anywhere.',
        criticalLabel: 'Critical',
        warningLabel: 'Warning',
        okLabel: 'OK',
        answerLabel: 'Detected Answer',
        recommendationLabel: 'Action Required',
        portalLabel: 'Detected Portal',
      },
    },
    profileManager: {
      heading: 'Profile & Backup Manager',
      subheading: 'Manage your localStorage profile, load demo data or start blank, export/import JSON backups, and install ProApply Studio.',
      profileStatusTitle: 'Active Local Profile',
      loadSampleBtn: 'Load Sample Data (Demo)',
      clearBlankBtn: 'Clear / Start Blank',
      exportJsonBtn: 'Export Profile (.json)',
      importJsonBtn: 'Import Profile (.json)',
      quickExportsTitle: 'Quick Document Exports',
      downloadCv: 'Download English CV PDF',
      downloadId: 'Download National ID PDF',
      downloadCerts: 'Download Certificates PDF',
      downloadBundle: 'Download Full Bundle (.zip)',
      goToIdMerger: 'Open ID Merger',
      goToCertBundle: 'Open Certificates PDF',
      pwaTitle: 'PWA Installation Guide',
      pwaSubtitle: 'Install ProApply Studio on your home screen or desktop for offline PDF & image formatting.',
      androidTitle: 'Android (Chrome / Edge)',
      androidSteps: 'Tap "Install App" above or open the browser menu (⋮) and choose "Install app" / "Add to Home screen".',
      iosTitle: 'iPhone & iPad (Safari)',
      iosSteps: 'Tap the Share button at the bottom of Safari, scroll down, and tap "Add to Home Screen".',
      desktopTitle: 'Windows & macOS (Chrome / Edge)',
      desktopSteps: 'Click the Install icon on the right side of the address bar or click "Install App".',
      emptyProfileStatus: 'Blank profile — enter your details in CV Builder or load sample data to test.',
      activeProfileStatus: 'Saved automatically in browser localStorage.',
    },
    toasts: {
      profileSaved: 'Saved to Profile',
      sampleLoaded: 'Sample demo profile loaded',
      profileCleared: 'Profile cleared to blank state',
      cvTailored: 'CV tailored to target job posting',
      cvPdfGenerated: 'English CV PDF generated',
      idPdfGenerated: 'National_ID_Merged.pdf generated',
      certsPdfGenerated: 'Certificates_Portfolio.pdf generated',
      coverLetterGenerated: 'Cover letter drafted',
      coverLetterCopied: 'Cover letter copied to clipboard',
      coverLetterPdfGenerated: 'Cover letter PDF generated',
      cardsSwapped: 'Front and Back cards swapped',
      bundleDownloaded: 'Application bundle downloaded',
      backupExported: 'Profile JSON exported',
      backupImported: 'Profile JSON imported and saved',
      missingJobAd: 'Please paste a job description first.',
      missingFormText: 'Please paste your application form review text first.',
      missingIdCards: 'Please upload both Front and Back ID images first.',
      missingCerts: 'Please upload at least one certificate or document image.',
    },
    pwa: {
      iosTitle: 'Install ProApply Studio on iPhone / iPad',
      iosSteps: 'Tap the Share button in Safari, then scroll down and select "Add to Home Screen".',
      desktopTitle: 'Install ProApply Studio',
      desktopSteps: 'Use the Install icon in your browser address bar or browser menu ("Install ProApply Studio") to launch offline as a standalone app.',
      close: 'Close',
    },
  },
  ar: {
    appName: 'ProApply Studio',
    appSubtitle: 'تجهيز السيرة الذاتية والمستندات الرسمية',
    nav: {
      cvBuilder: 'منشئ السيرة',
      idMerger: 'دمج البطاقة',
      certBundle: 'ملف الشهادات',
      coverAndAudit: 'الخطاب والتدقيق',
      profileManager: 'الملف والنسخ',
    },
    topbar: {
      langSwitch: 'English',
      installApp: 'تثبيت التطبيق',
      installAppShort: 'تثبيت',
      offlineBanner: 'وضع عدم الاتصال — أدوات PDF ودمج البطاقة والشهادات تعمل محلياً بالكامل.',
      saveProfile: 'حفظ الملف',
      loadSample: 'تحميل بيانات تجريبية',
      clearBlank: 'مسح والبدء من الصفر',
    },
    cv: {
      heading: 'منشئ السيرة الذاتية الإنجليزية (فوري)',
      subheading: 'أنشئ سيرة ذاتية بقالب ATS فوري وصدّرها في صفحة A4 واحدة. التخصيص بالذكاء الاصطناعي متوقف حاليا.',
      modeInstant: 'الوضع الفوري (بدون انتظار)',
      modeAi: 'تخصيص بالذكاء الاصطناعي (متوقف)',
      instantModeDesc: 'توليد فوري للسيرة الذاتية الإنجليزية من صفحة واحدة مباشرة من بيانات ملفك الشخصي.',
      jobAdTitle: 'الوصف الوظيفي المستهدف (عربي أو إنجليزي)',
      jobAdPlaceholder: 'الصق نص إعلان الوظيفة أو المتطلبات هنا...',
      tailorWithAi: 'التخصيص بالذكاء الاصطناعي (متوقف)',
      tailoring: 'جاري التخصيص...',
      downloadPdf: 'تصدير PDF صفحة واحدة',
      loadSample: 'تحميل بيانات تجريبية',
      clearBlank: 'مسح / بدء فارغ',
      englishOnlyNotice: 'تُصدر السيرة الذاتية باللغة الإنجليزية الاحترافية المتوافقة مع أنظمة ATS.',
      previewTitle: 'معاينة PDF المباشرة (A4)',
      singlePageFit: 'مضمون على صفحة A4 واحدة',
      densityLabel: 'القياس التلقائي',
      pageWord: 'صفحة',
      ofWord: 'من',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      zoomFit: 'ملاءمة',
      renderingPdf: 'جاري تحديث PDF...',
      renderError: 'تعذر عرض معاينة PDF.',
      retryRender: 'إعادة المحاولة',
      sections: {
        personal: 'البيانات الشخصية',
        summary: 'الملخص المهني',
        skills: 'الكفاءات الأساسية',
        experience: 'الخبرات العملية',
        education: 'التعليم',
        certificates: 'الشهادات والتدريب',
      },
      fields: {
        fullName: 'الاسم الكامل',
        targetRole: 'المسمى الوظيفي المستهدف',
        location: 'الموقع',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        linkedin: 'رابط لينكدإن',
        summary: 'الملخص التنفيذي',
        skillsHint: 'مهارات مفصولة بفاصلة (مثال: Data Entry, SQL, Python)',
        role: 'المسمى الوظيفي',
        company: 'جهة العمل / المشروع',
        period: 'الفترة الزمنية',
        bulletsHint: 'إنجاز أو مسؤولية واحدة في كل سطر',
        degree: 'الدرجة العلمية / التخصص',
        institution: 'المؤسسة التعليمية',
        graduation: 'سنة التخرج المتوقعة',
        certificatesHint: 'شهادة واحدة في كل سطر',
        addExperience: 'إضافة خبرة',
        removeExperience: 'حذف',
      },
    },
    idMerger: {
      heading: 'دمج بطاقة الرقم القومي',
      subheading: 'ارفع صورتي الوجه الأمامي والخلفي من الملفات أو المعرض لدمجهما في صفحة A4 واحدة بيضاء بدون أي نصوص.',
      frontSlot: 'الوجه الأمامي (Front Side)',
      backSlot: 'الوجه الخلفي (Back Side)',
      uploadPrompt: 'اختيار صورة من الجهاز / المعرض',
      rotateCcw: 'تدوير 90° عكس الساعة',
      rotateCw: 'تدوير 90° مع الساعة',
      swapCards: 'تبديل الأمامي والخلفي',
      enhanceToggle: 'تحسين التباين والوضوح',
      enhanceDescription: 'يعزز وضوح النصوص والباركود مباشرة داخل مصفوفة الصورة.',
      clearSlot: 'مسح',
      zeroTextNote: 'يُصدّر ملف National_ID_Merged.pdf على صفحة A4 بيضاء واحدة بدون أي عناوين أو علامات مائية.',
      a4PreviewTitle: 'معاينة صفحة A4 الصارمة',
      generatePdf: 'تصدير National_ID_Merged.pdf',
      emptyPreview: 'ارفع صورتي الوجه الأمامي والخلفي لمعاينة التموضع الدقيق على صفحة A4.',
      dimensionsLabel: 'أبعاد الصورة',
    },
    certBundle: {
      heading: 'حزمة الشهادات والمستندات PDF',
      subheading: 'ارفع صور الشهادات أو المستندات ودوّر كل صورة واختر 1 أو 2 أو 4 عناصر في كل صفحة A4.',
      uploadButton: 'إضافة صور من الملفات / المعرض',
      uploadHint: 'يدعم اختيار عدة صور PNG أو JPG أو WebP دفعة واحدة.',
      layoutLabel: 'عدد العناصر في صفحة A4',
      perPage1: '1 في الصفحة',
      perPage2: '2 في الصفحة',
      perPage4: '4 في الصفحة',
      exportPdf: 'تصدير Certificates_Portfolio.pdf',
      clearAll: 'مسح الكل',
      emptyTitle: 'لا توجد مستندات مضافة بعد',
      emptySubtitle: 'اختر صور الشهادات أو المستندات الرسمية من جهازك لترتيبها وتصديرها في ملف A4 واحد منسق.',
      pagePreviewTitle: 'معاينة صفحات A4',
      moveUp: 'تقديم',
      moveDown: 'تأخير',
      rotateCcw: '90° عكس',
      rotateCw: '90° مع',
      remove: 'حذف',
      pageCountLabel: 'إجمالي الصفحات',
    },
    coverAndAudit: {
      heading: 'خطاب التغطية ومراجع الاستمارة (بدون إنترنت، بدون ذكاء اصطناعي)',
      subheading: 'أنشئ خطاب التغطية وراجع إجابات الاستمارة بدون إنترنت. ميزات الذكاء الاصطناعي متوقفة في هذه النسخة العامة، ولا يُرسل أي شيء تكتبه.',
      tabCoverLetter: 'منشئ خطاب التغطية',
      tabFormChecker: 'مراجع استمارة التقديم',
      cover: {
        companyLabel: 'اسم الجهة / الشركة (اختياري)',
        companyPlaceholder: 'مثال: Example Co، Sample Org',
        jobTitleLabel: 'المسمى الوظيفي (اختياري)',
        jobTitlePlaceholder: 'مثال: Data Entry Specialist',
        jobDescLabel: 'الوصف الوظيفي المستهدف',
        jobDescPlaceholder: 'الصق إعلان الوظيفة أو المسؤوليات هنا...',
        generateButton: 'إنشاء خطاب التغطية (متوقف)',
        templateButton: 'إنشاء من بياناتي (بدون ذكاء اصطناعي)',
        templateNote: 'يُبنى فقط من البيانات التي أدخلتها في تبويب السيرة الذاتية، ويمكنك تعديله قبل التصدير.',
        profileMissingNote: 'املأ بياناتك في تبويب السيرة الذاتية أولاً ثم أنشئ الخطاب.',
        generating: 'جاري الصياغة...',
        subjectLabel: 'عنوان البريد / الطلب',
        bodyLabel: 'نص خطاب التغطية (قابل للتعديل)',
        copyButton: 'نسخ النص',
        downloadTxt: 'تنزيل .TXT',
        downloadPdf: 'تنزيل PDF',
        emptyTitle: 'أنشئ خطاب التغطية',
        emptySubtitle: 'الصياغة بالذكاء الاصطناعي متوقفة في هذه النسخة العامة، لكن يمكنك إنشاء الخطاب من بياناتك ثم تعديله وتصديره. لا يُرسل أي شيء تكتبه هنا.',
      },
      reviewer: {
        inputLabel: 'نص صفحة المراجعة النهائية للاستمارة',
        inputPlaceholder: 'الصق جميع الأسئلة وإجاباتك المختارة من بوابات التوظيف...',
        loadSample: 'تحميل نموذج تجريبي',
        clearInput: 'مسح النص',
        auditButton: 'تدقيق الاستمارة (الذكاء الاصطناعي متوقف)',
        offlineAuditButton: 'راجع الإجابات (بدون ذكاء اصطناعي)',
        offlineDone: 'المراجعة جاهزة. راجع الملاحظات قبل الإرسال.',
        auditing: 'جاري التدقيق...',
        resultsTitle: 'نتائج التدقيق',
        emptyTitle: 'راجع إجابات استمارتك',
        emptySubtitle: 'المراجعة بالذكاء الاصطناعي متوقفة في هذه النسخة العامة، لكن المراجعة بدون إنترنت تكشف الإجابات الخطرة أو الفارغة. لا يُرسل أي شيء تكتبه هنا.',
        criticalLabel: 'حرج',
        warningLabel: 'تحذير',
        okLabel: 'سليم',
        answerLabel: 'الإجابة المرصودة',
        recommendationLabel: 'الإجراء المطلوب',
        portalLabel: 'البوابة المكتشفة',
      },
    },
    profileManager: {
      heading: 'إدارة الملف والنسخ الاحتياطي',
      subheading: 'تحكم في البيانات المحفوظة محلياً، حمّل بيانات تجريبية أو ابدأ من الصفر، وصدّر/استورد ملف JSON.',
      profileStatusTitle: 'حالة الملف المحلي',
      loadSampleBtn: 'تحميل البيانات التجريبية (Demo)',
      clearBlankBtn: 'مسح والبدء من الصفر',
      exportJsonBtn: 'تصدير الملف (.json)',
      importJsonBtn: 'استيراد الملف (.json)',
      quickExportsTitle: 'تنزيل المستندات السريع',
      downloadCv: 'تنزيل السيرة الإنجليزية PDF',
      downloadId: 'تنزيل البطاقة المدمجة PDF',
      downloadCerts: 'تنزيل ملف الشهادات PDF',
      downloadBundle: 'تنزيل الحزمة الكاملة (.zip)',
      goToIdMerger: 'فتح دمج البطاقة',
      goToCertBundle: 'فتح ملف الشهادات',
      pwaTitle: 'دليل تثبيت التطبيق (PWA)',
      pwaSubtitle: 'ثبّت ProApply Studio على هاتفك أو حاسوبك لاستخدام أدوات PDF والصور بدون إنترنت.',
      androidTitle: 'أندرويد (Chrome / Edge)',
      androidSteps: 'اضغط "تثبيت التطبيق" أعلاه أو افتح قائمة المتصفح (⋮) واختر "تثبيت التطبيق".',
      iosTitle: 'آيفون وآيباد (Safari)',
      iosSteps: 'اضغط زر المشاركة أسفل Safari ثم مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية".',
      desktopTitle: 'ويندوز وماك (Chrome / Edge)',
      desktopSteps: 'انقر على أيقونة التثبيت في شريط العنوان أو اضغط زر "تثبيت التطبيق".',
      emptyProfileStatus: 'ملف فارغ — أدخل بياناتك في منشئ السيرة أو حمّل البيانات التجريبية.',
      activeProfileStatus: 'محفوظ تلقائياً في ذاكرة المتصفح localStorage.',
    },
    toasts: {
      profileSaved: 'تم حفظ الملف الشخصي',
      sampleLoaded: 'تم تحميل البيانات التجريبية',
      profileCleared: 'تم مسح الملف الشخصي والبدء من الصفر',
      cvTailored: 'تم تخصيص السيرة الذاتية للوظيفة',
      cvPdfGenerated: 'تم إنشاء ملف السيرة الذاتية PDF',
      idPdfGenerated: 'تم إنشاء ملف National_ID_Merged.pdf',
      certsPdfGenerated: 'تم إنشاء ملف Certificates_Portfolio.pdf',
      coverLetterGenerated: 'تم إنشاء خطاب التغطية',
      coverLetterCopied: 'تم نسخ خطاب التغطية',
      coverLetterPdfGenerated: 'تم إنشاء ملف خطاب التغطية PDF',
      cardsSwapped: 'تم تبديل الوجه الأمامي والخلفي',
      bundleDownloaded: 'تم تنزيل الحزمة الكاملة',
      backupExported: 'تم تصدير ملف JSON الاحتياطي',
      backupImported: 'تم استيراد الملف الشخصي وحفظه',
      missingJobAd: 'يرجى لصق الوصف الوظيفي أولاً.',
      missingFormText: 'يرجى لصق نص صفحة مراجعة الاستمارة أولاً.',
      missingIdCards: 'يرجى رفع صورتي الوجه الأمامي والخلفي أولاً.',
      missingCerts: 'يرجى رفع صورة شهادة أو مستند واحد على الأقل.',
    },
    pwa: {
      iosTitle: 'تثبيت ProApply Studio على iPhone / iPad',
      iosSteps: 'اضغط زر المشاركة في Safari ثم مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية".',
      desktopTitle: 'تثبيت تطبيق ProApply Studio',
      desktopSteps: 'استخدم أيقونة التثبيت في شريط عنوان المتصفح أو قائمة المتصفح لتشغيل التطبيق بدون إنترنت.',
      close: 'إغلاق',
    },
  },
};

