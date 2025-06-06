$(document).ready(function() {
    // Elements
    const imageUpload = $('#image-upload');
    const imagePreview = $('#image-preview');
    const browseBtn = $('#browse-btn');
    const analyzeBtn = $('#analyze-btn');
    const reportContainer = $('#report-container');
    const downloadPdfBtn = $('#download-pdf');
    
    // Initialize empty array for uploaded images
    let uploadedImages = [];
    
    // Browse button click handler - fixed
    browseBtn.on('click', function() {
        imageUpload.trigger('click');
    });
    
    // Image upload change handler
    imageUpload.on('change', function(e) {
        const files = Array.from(e.target.files);
        uploadedImages = files;
        updatePreviewContent();
    });
    
    // Enhanced drag and drop with visual feedback
    imagePreview.on('dragover', function(e) {
        e.preventDefault();
        $(this).addClass('bg-blue-100 border-blue-300 transform scale-[1.02]');
        $(this).html('<div class="text-center text-blue-600"><i class="fas fa-cloud-upload-alt text-4xl mb-2"></i><p>Drop images to upload</p></div>');
    });
    
    imagePreview.on('dragleave', function() {
        $(this).removeClass('bg-blue-100 border-blue-300 transform scale-[1.02]');
        updatePreviewContent();
    });
    
    imagePreview.on('drop', function(e) {
        e.preventDefault();
        $(this).removeClass('bg-blue-100 border-blue-300 transform scale-[1.02]');
        const files = e.originalEvent.dataTransfer.files;
        imageUpload[0].files = files;
        imageUpload.trigger('change');
    });
    
    // Function to update preview content
    function updatePreviewContent() {
        imagePreview.empty();
        
        if (uploadedImages.length === 0) {
            imagePreview.html(`
                <div class="text-center text-gray-500">
                    <i class="fas fa-cloud-upload-alt text-4xl mb-2"></i>
                    <p>Drag & drop images here or click to browse</p>
                </div>
            `);
            return;
        }
        
        uploadedImages.forEach(file => {
            if (!file.type.match('image.*')) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = $(`<img src="${e.target.result}" class="preview-image w-32 h-32 object-cover rounded-lg border-2 border-white shadow-md cursor-pointer">`);
                imagePreview.append(img);
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Initialize preview
    updatePreviewContent();
    
    // Analyze button click handler
    analyzeBtn.on('click', function() {
        const patientName = $('#patient-name').val().trim();
        const patientAge = $('#patient-age').val().trim();
        const patientGender = $('#patient-gender').val();
        const examType = $('#exam-type').val().trim();
        const language = $('#language').val();
        const promptTemplate = $('#prompt-template').val();
        const clinicalContext = $('#clinical-context').val().trim();
        
        // Validation
        if (!patientName || !patientAge || !patientGender || !examType ||
            !language || !promptTemplate || !clinicalContext || uploadedImages.length === 0) {
            alert('Please fill all required fields and upload at least one image');
            return;
        }
        
        // Show loading state
        analyzeBtn.prop('disabled', true);
        analyzeBtn.html('<div class="loading inline-block mr-2"></div> Analyzing images...');
        reportContainer.html(`
            <div class="flex flex-col items-center justify-center h-full">
                <div class="loading text-4xl mb-4 text-blue-600"></div>
                <p class="text-gray-600">Processing your medical images...</p>
            </div>
        `);
        
        // Create FormData
        const formData = new FormData();
        formData.append('patient_name', patientName);
        formData.append('patient_age', patientAge);
        formData.append('patient_gender', patientGender);
        formData.append('exam_type', examType);
        formData.append('language', language);
        formData.append('prompt_template', promptTemplate);
        formData.append('clinical_context', clinicalContext);
        
        // Add all images to form data
        uploadedImages.forEach((file, index) => {
            formData.append(`images`, file);
        });
        
        // Send AJAX request
        $.ajax({
            url: '/analyze',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(result) {
                if (result.error) {
                    reportContainer.html(`
                        <div class="text-red-500 p-4 rounded-lg bg-red-50">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            ${result.error}
                        </div>
                    `);
                } else {
                    // Create iframe to isolate report styling
                    const iframe = document.createElement('iframe');
                    iframe.style.width = '100%';
                    iframe.style.minHeight = '80vh';
                    iframe.style.maxHeight = '80vh';
                    iframe.style.border = 'none';
                    iframe.style.background = 'rgba(255, 255, 255, 0.8)';
                    iframe.style.overflow = 'hidden';
                    iframe.style.borderRadius = '12px';
                    
                    // Wrap report content with base HTML structure
                    const fullHtml = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <base href="${window.location.origin}" />
                            <style>
                                body {
                                    margin: 0;
                                    padding: 10px;
                                    font-family: Arial, sans-serif;
                                    background: rgba(255, 255, 255, 0.8);
                                    min-height: 100%;
                                    overflow: auto;
                                }
                                /* Add any other report-specific styles here */
                            </style>
                        </head>
                        <body>
                            ${result.report}
                        </body>
                        </html>
                    `;
                    
                    iframe.srcdoc = fullHtml;
                    
                    reportContainer.html(`
                        <div class="flex flex-col h-full">
                            <h4 class="font-bold text-lg text-blue-800 mb-2 p-2">Medical Analysis Report</h4>
                            <div class="flex-1 flex flex-col" style="overflow-y: auto;">
                                ${iframe.outerHTML}
                            </div>
                        </div>
                    `);
                }
            },
            error: function(xhr) {
                let errorMsg = `Server error: ${xhr.status} ${xhr.statusText}`;
                try {
                    const errorBody = JSON.parse(xhr.responseText);
                    errorMsg += ` - ${errorBody.error || JSON.stringify(errorBody)}`;
                } catch (e) {
                    // Ignore JSON parse errors
                }
                reportContainer.html(`
                    <div class="text-red-500 p-4 rounded-lg bg-red-50">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        ${errorMsg}
                    </div>
                `);
            },
            complete: function() {
                analyzeBtn.prop('disabled', false);
                analyzeBtn.html('<i class="fas fa-microscope mr-3"></i>Analyze Images');
            }
        });
    });
    
    // Download PDF button using html2canvas and jsPDF
    downloadPdfBtn.on('click', function() {
        // Get the iframe element inside reportContainer
        const iframe = reportContainer.find('iframe')[0];
        if (!iframe || !iframe.contentDocument) {
            alert('No report available to download');
            return;
        }
        const iframeDoc = iframe.contentDocument;
        const reportElement = iframeDoc.documentElement;
        
        // Check if report content exists
        if (!reportElement.body.children.length || reportElement.body.innerText.trim() === '') {
            alert('No report available to download');
            return;
        }

        const patientName = $('#patient-name').val().trim() || 'MedicalReport';
        const fileName = `${patientName.replace(/\s+/g, '_')}_Report.pdf`;
        
        // Show loading indicator
        const originalText = downloadPdfBtn.html();
        downloadPdfBtn.prop('disabled', true);
        downloadPdfBtn.html('<div class="loading inline-block mr-2"></div> Generating PDF...');
        
        try {
            // First try HTML-based PDF generation for better text quality
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Add patient info
            doc.setFontSize(12);

            // Add report content as HTML with better pagination
            const today = new Date();
            const dateStr = today.toLocaleDateString();
            
            // Add CSS to prevent content overflow and force page breaks
            const pageBreakStyle = document.createElement('style');
            pageBreakStyle.innerHTML = `
                .page-break {
                    page-break-after: always;
                    break-after: page;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            `;
            document.head.appendChild(pageBreakStyle);
            
            // Add footer to each page during rendering
            doc.html(reportElement, {
                x: 10,
                y: 40,
                width: 180, // mm (A4 width is 210mm)
                windowWidth: 800,
                autoPaging: 'text',
                margin: [10, 10, 10, 0], // Add bottom margin for footer
                html2canvas: {
                    scale: 0.24,
                    useCORS: true,
                    allowTaint: true,
                    ignoreElements: (element) => false
                },
                // Add header and footer during page creation
                pageBreak: {
                    before: '.page-break-before',
                    after: '.page-break-after',
                    avoid: ['.no-page-break']
                },
                header: function(currentPage, pageCount) {
                    return {
                        height: 20,
                        contents: `<div style="text-align:center;font-size:10px;">Page ${currentPage} of ${pageCount}</div>`
                    };
                },
                footer: function(currentPage, pageCount) {
                    return {
                        height: 20,
                        contents: `<div style="text-align:left;font-size:10px;padding-left:15mm">Generated: ${dateStr}</div>`
                    };
                },
                callback: function(doc) {
                    // Remove temporary style
                    document.head.removeChild(pageBreakStyle);
                    
                    // Save PDF and restore button state
                    doc.save(fileName);
                    downloadPdfBtn.prop('disabled', false);
                    downloadPdfBtn.html(originalText);
                }
            });
        } catch (htmlError) {
            console.warn('HTML PDF generation failed, falling back to canvas', htmlError);
            
            // Fallback to canvas method
            html2canvas(reportElement, {
                // Ensure we capture content from iframe
                windowWidth: iframeDoc.documentElement.scrollWidth,
                windowHeight: iframeDoc.documentElement.scrollHeight,
                scale: 0.24,
                useCORS: true,
                allowTaint: true,
                scrollY: 0,
                ignoreElements: (element) => false,
                onclone: (clonedDoc) => {
                    // Inject all styles into the cloned document
                    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
                    styles.forEach(style => {
                        clonedDoc.head.appendChild(style.cloneNode(true));
                    });
                }
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                
                // Calculate image dimensions
                const imgWidth = pageWidth - 20;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                // Improved pagination logic
                let yPosition = 40; // Start below patient info
                let remainingHeight = imgHeight;
                let pageCount = 0;
                
                while (remainingHeight > 0) {
                    if (pageCount > 0) {
                        doc.addPage();
                        yPosition = 10; // Reset Y position for new pages
                    }
                    
                    const heightThisPage = Math.min(remainingHeight, pageHeight - yPosition - 20);
                    
                    doc.addImage(
                        imgData,
                        'PNG',
                        10,
                        yPosition,
                        imgWidth,
                        heightThisPage,
                        null,
                        'FAST',
                        -pageCount * (pageHeight - 20)  // Proper vertical offset
                    );
                    
                    remainingHeight -= heightThisPage;
                    yPosition += heightThisPage;
                    pageCount++;
                }
                
                // Add footer to each page
                const totalPages = doc.internal.getNumberOfPages();
                const today = new Date();
                const dateStr = today.toLocaleDateString();
                
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.setFontSize(10);
                    doc.text(`Generated: ${dateStr}`, 15, pageHeight - 10);
                    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
                }
                
                // Save PDF and restore button state
                doc.save(fileName);
                downloadPdfBtn.prop('disabled', false);
                downloadPdfBtn.html(originalText);
            }).catch(canvasError => {
                alert('Error generating PDF: ' + canvasError.message);
                downloadPdfBtn.prop('disabled', false);
                downloadPdfBtn.html(originalText);
            });
        }
    });

    // Add animated background particles
    function initParticles() {
        const canvas = $('<canvas id="particle-canvas" class="fixed inset-0 -z-10"></canvas>');
        $('body').prepend(canvas);
        
        const ctx = canvas[0].getContext('2d');
        canvas[0].width = window.innerWidth;
        canvas[0].height = window.innerHeight;
        
        const particles = [];
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas[0].width,
                y: Math.random() * canvas[0].height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.1,
                angle: Math.random() * Math.PI * 2,
                color: `rgba(30, 136, 229, ${Math.random() * 0.3})`
            });
        }
        
        function animateParticles() {
            ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
            
            particles.forEach(p => {
                p.x += Math.cos(p.angle) * p.speed;
                p.y += Math.sin(p.angle) * p.speed;
                
                if (p.x < 0 || p.x > canvas[0].width) p.angle = Math.PI - p.angle;
                if (p.y < 0 || p.y > canvas[0].height) p.angle = -p.angle;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });
            
            requestAnimationFrame(animateParticles);
        }
        
        animateParticles();
        
        // Handle window resize
        $(window).on('resize', function() {
            canvas[0].width = window.innerWidth;
            canvas[0].height = window.innerHeight;
        });
    }
    
    // Add AI insights panel
    function initInsightsPanel() {
        const insights = [
            "Tip: Upload multiple images for comprehensive analysis",
            "Best Practice: Provide detailed clinical context for more accurate reports",
            "AI Insight: Early detection improves treatment outcomes by 70%"
        ];
        
        const panel = $(`
            <div class="fixed right-4 top-1/2 transform -translate-y-1/2 w-64 bg-white rounded-xl shadow-xl z-20 overflow-hidden">
                <div class="bg-blue-800 text-white py-3 px-4 flex justify-between items-center">
                    <h3 class="font-bold"><i class="fas fa-lightbulb mr-2"></i>AI Insights</h3>
                    <button id="toggle-insights" class="text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="insights-content" class="p-4">
                    ${insights.map((t, i) => `
                        <div class="insight-item mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100 ${i === 0 ? 'active' : ''}">
                            <i class="fas fa-info-circle text-blue-600 mr-2"></i>${t}
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
        
        $('body').append(panel);
        
        // Rotate insights every 10 seconds
        let currentInsight = 0;
        setInterval(() => {
            currentInsight = (currentInsight + 1) % insights.length;
            $('.insight-item').removeClass('active');
            $('.insight-item').eq(currentInsight).addClass('active');
        }, 10000);
        
        // Toggle panel
        $('#toggle-insights').on('click', function() {
            panel.toggleClass('hidden');
        });
    }
    
    // Initialize innovative features
    initParticles();
    initInsightsPanel();
    
    // Add image filters toggle
    imagePreview.on('click', '.preview-image', function() {
        $(this).toggleClass('filter-med');
    });
    
    // Add custom medical filters
    $('head').append(`
    <style>
    .preview-image.filter-med {
        filter: sepia(0.5) contrast(1.2) brightness(1.1);
        border: 3px solid #1e88e5;
        box-shadow: 0 0 15px rgba(30, 136, 229, 0.5);
    }
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(26,115,232,0.3);
        border-radius: 50%;
        border-top-color: #1e88e5;
        animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    </style>
    `);
});