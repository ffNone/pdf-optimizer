let selectedImages = [];

// التعامل مع اختيار الصور
document.getElementById('images').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    const preview = document.getElementById('imagePreview');
    
    // تحويل الملفات إلى Array من الصور
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            selectedImages.push({
                src: event.target.result,
                name: file.name
            });
            displayImage(event.target.result, selectedImages.length - 1, preview);
        };
        reader.readAsDataURL(file);
    });
});

// عرض الصور في المعاينة
function displayImage(src, index, container) {
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.innerHTML = `
        <img src="${src}" alt="معاينة">
        <div class="remove-image" onclick="removeImage(${index})"></div>
    `;
    container.appendChild(imageItem);
}

// حذف صورة من المعاينة
function removeImage(index) {
    selectedImages.splice(index, 1);
    refreshImagePreview();
}

// تحديث معاينة الصور
function refreshImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    selectedImages.forEach((img, index) => {
        displayImage(img.src, index, preview);
    });
}

// معالجة إرسال النموذج
document.getElementById('pdfForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fileName = document.getElementById('fileName').value.trim();
    const textContent = document.getElementById('textContent').value.trim();
    
    if (!fileName || !textContent) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    generatePDF(fileName, textContent, selectedImages);
});

// إنشاء ملف PDF
function generatePDF(fileName, textContent, images) {
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.backgroundColor = 'white';
    element.style.direction = 'rtl';
    element.style.textAlign = 'right';
    
    // إضافة النص
    const textDiv = document.createElement('div');
    textDiv.style.fontSize = '26px';
    textDiv.style.fontWeight = 'bold';
    textDiv.style.lineHeight = '1.6';
    textDiv.style.marginBottom = '20px';
    textDiv.style.color = '#000';
    textDiv.style.fontFamily = 'Arial, sans-serif';
    textDiv.innerHTML = escapeHtml(textContent).replace(/\n/g, '<br>');
    element.appendChild(textDiv);
    
    // إضافة الصور إذا كانت موجودة
    if (images && images.length > 0) {
        const imagesContainer = document.createElement('div');
        imagesContainer.style.display = 'flex';
        imagesContainer.style.flexWrap = 'wrap';
        imagesContainer.style.gap = '10px';
        imagesContainer.style.marginTop = '20px';
        imagesContainer.style.justifyContent = 'flex-end';
        
        images.forEach(img => {
            const imgWrapper = document.createElement('div');
            imgWrapper.style.textAlign = 'center';
            
            const imgElement = document.createElement('img');
            imgElement.src = img.src;
            imgElement.style.maxWidth = '500px';
            imgElement.style.maxHeight = '200px';
            imgElement.style.border = '1px solid #ddd';
            imgElement.style.borderRadius = '4px';
            
            imgWrapper.appendChild(imgElement);
            imagesContainer.appendChild(imgWrapper);
        });
        
        element.appendChild(imagesContainer);
    }
    
    // تحديد خيارات html2pdf
    const opt = {
        margin: 10,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { 
            orientation: 'portrait', 
            unit: 'mm', 
            format: 'a4',
            compress: true
        }
    };
    
    // إنشاء وتحميل PDF
    html2pdf().set(opt).from(element).save();
    
    // إعادة تعيين النموذج
    setTimeout(() => {
        document.getElementById('pdfForm').reset();
        selectedImages = [];
        document.getElementById('imagePreview').innerHTML = '';
        alert('تم تحميل ملف PDF بنجاح!');
    }, 1000);
}

// دالة لتجنب مشاكل XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
