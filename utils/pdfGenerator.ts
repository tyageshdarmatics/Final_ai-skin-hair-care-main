import { SkinConditionCategory, ProductRecommendation } from '../types';

export const generatePDF = (
    analysis: SkinConditionCategory[] | null,
    recommendations: ProductRecommendation[],
    goals: string[] = [],
    userInfo: { name?: string } = {},
    userImage?: string
) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to download the report.');
        return;
    }

    // 1. Title Generation (Personalized)
    const firstName = userInfo.name ? userInfo.name.split(' ')[0] : 'User';
    const mainConcern = analysis && analysis.length > 0 ? analysis[0].category : 'Skin & Hair';
    const reportTitle = `${firstName}'s Personalized ${mainConcern} Plan`;

    // Handle user image prefix if missing
    let formattedUserImage = userImage;
    if (userImage && !userImage.startsWith('data:')) {
        formattedUserImage = `data:image/jpeg;base64,${userImage}`;
    }

    // 2. Analysis HTML
    const analysisHtml = analysis ? analysis.map(cat => `
        <div class="section-item">
            <h4 style="margin: 0 0 5px 0; color: #374151;">${cat.category}</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                ${(cat.conditions || []).map(c => `
                    <li style="margin-bottom: 4px;">
                        <strong>${c.name}</strong> (${Math.round(c.confidence)}%) - ${c.location}
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('') : '<p>No analysis data available.</p>';

    // 3. Goals HTML
    const goalsHtml = goals.length > 0
        ? goals.map(g => `<span class="goal-tag">${g}</span>`).join('')
        : '<p style="font-size: 14px;">Maintenance and general health.</p>';

    // 4. Routine HTML (Text-only as requested)
    const recommendationsHtml = (recommendations || []).map(rec => `
        <div class="routine-section">
            <h3 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px;">
                ${rec.category === 'Morning Routine' ? 'AM Routine ☀️' : rec.category === 'Evening Routine' ? 'PM Routine 🌙' : rec.category}
            </h3>
            <div class="products-text-list">
                ${(rec.products || []).map(p => `
                    <div class="product-text-item">
                        <p style="margin: 0; font-size: 15px;">
                            <strong>${p.tags[0] || 'Step'}:</strong> ${p.name}
                        </p>
                        ${p.reason ? `<p class="product-explanation">${p.reason}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // 5. Additional Advice Logic
    const allTags = Array.from(new Set(recommendations.flatMap(r => r.products.flatMap(p => p.tags))));
    const ingredients = allTags.filter(t => !['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Morning Routine', 'Evening Routine', 'Treatment'].includes(t));

    const ingredientsHtml = ingredients.length > 0
        ? ingredients.map(i => `<li style="margin-bottom: 5px;">${i}</li>`).join('')
        : '<li style="margin-bottom: 5px;">Hyaluronic Acid</li><li style="margin-bottom: 5px;">Niacinamide</li>';

    // Helper function to generate prescription instructions
    const generatePrescription = (products: any[], routineType: 'AM' | 'PM') => {

        const getUsageDetails = (product: any) => {

            const tags = product.tags || [];
            const name = product.name.toLowerCase();

            let when = routineType === 'AM' ? 'Morning' : 'Night';
            let frequency = 'Once daily';
            let duration = '8–12 weeks';
            let howToUse = '';
            let caution = '';

            /* SKINCARE RULES */

            if (tags.includes('Cleanser')) {
                howToUse = 'Massage onto damp skin for 30–40 seconds, then rinse thoroughly.';
                frequency = 'Twice daily';
                duration = 'Ongoing';
            }

            else if (tags.includes('Sunscreen')) {
                howToUse = 'Apply generously 15 minutes before sun exposure. Reapply every 2–3 hours.';
                frequency = 'Daily (Daytime only)';
                duration = 'Daily ongoing use';
            }

            else if (tags.includes('Moisturizer')) {
                howToUse = 'Apply evenly over face and neck after serum.';
                frequency = routineType === 'AM' ? 'Morning' : 'Night';
                duration = 'Ongoing';
            }

            else if (tags.includes('Serum')) {
                howToUse = 'Apply 2–3 drops and gently pat into skin.';
                duration = '8–12 weeks';
            }

            if (name.includes('retinol') || tags.includes('Retinol')) {
                howToUse = 'Apply pea-sized amount on dry skin. Avoid eye area.';
                frequency = 'Start 3 times per week, increase gradually';
                duration = 'Minimum 12 weeks';
                caution = 'Use sunscreen during the day. Avoid combining with strong exfoliants.';
            }

            if (name.includes('salicylic')) {
                duration = '6–8 weeks';
            }

            /* HAIRCARE RULES */

            if (tags.includes('Shampoo') || name.includes('shampoo')) {
                howToUse = 'Apply to wet scalp, massage gently for 1–2 minutes, then rinse thoroughly.';
                frequency = '3–4 times per week';
                duration = 'Ongoing';
                when = 'During bath';
            }

            if (tags.includes('Conditioner') || name.includes('conditioner')) {
                howToUse = 'Apply to hair lengths only. Leave for 2–3 minutes, then rinse.';
                frequency = 'After every shampoo';
                duration = 'Ongoing';
                when = 'During bath';
            }

            if (tags.includes('Hair Serum') || name.includes('hair serum')) {
                howToUse = 'Apply a small amount to dry or damp hair lengths. Do not rinse.';
                frequency = 'Once daily';
                duration = 'Ongoing';
            }

            if (tags.includes('Hair Oil') || name.includes('oil')) {
                howToUse = 'Massage gently into scalp. Leave for 1–2 hours before washing.';
                frequency = '2–3 times per week';
                duration = 'Ongoing';
            }

            if (
                name.includes('minoxidil') ||
                name.includes('hair growth') ||
                tags.includes('Minoxidil')
            ) {
                howToUse = 'Apply 1 ml directly to dry scalp in thinning areas. Do not wash for 4 hours.';
                frequency = 'Once daily';
                duration = 'Minimum 12–16 weeks';
                when = routineType === 'AM' ? 'Morning' : 'Night';
                caution = 'Do not apply on irritated scalp. Initial shedding may occur in first 2–4 weeks.';
            }

            return { when, frequency, duration, howToUse, caution };
        };

        return (products || []).map((p, index) => {

            const details = getUsageDetails(p);

            return `
            <div class="prescription-item">
                <div class="prescription-header">
                    <span class="rx-step">Step ${index + 1}</span>
                    <span class="rx-product">${p.name}</span>
                </div>

                <div class="rx-details">
                    <div><strong>When:</strong> ${details.when}</div>
                    <div><strong>How to Use:</strong> ${details.howToUse}</div>
                    <div><strong>Frequency:</strong> ${details.frequency}</div>
                    <div><strong>Duration:</strong> ${details.duration}</div>
                    ${p.reason ? `<div><strong>Purpose:</strong> ${p.reason}</div>` : ''}
                    ${details.caution ? `<div style="color:#b91c1c;"><strong>Caution:</strong> ${details.caution}</div>` : ''}
                </div>
            </div>
        `;
        }).join('');
    };


    // Final HTML Template
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dermatics Personalized Plan</title>

            <style>

            .prescription-item {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 15px;
                background: #f9fafb;
            }

            .prescription-header {
                display: flex;
                justify-content: space-between;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .rx-step {
                background: #1e3a8a;
                color: #ffffff;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
            }

            .rx-product {
                font-size: 14px;
                color: #111827;
            }

            .rx-details {
                font-size: 12px;
                color: #374151;
                line-height: 1.5;
            }


            .report-header {
                text-align: center;
                margin-bottom: 35px;
                padding-bottom: 20px;
                border-bottom: 2px solid #1e3a8a;
            }

            .brand {
                font-size: 20px;
                font-weight: 700;
                letter-spacing: 1px;
                color: #1e3a8a;
            }

            .brand-sub {
                font-size: 12px;
                font-weight: 500;
                color: #6b7280;
                margin-top: 3px;
            }

            .report-title {
                font-size: 22px;
                font-weight: 600;
                margin-top: 15px;
                color: #111827;
            }

            .report-meta {
                margin-top: 10px;
                font-size: 12px;
                color: #4b5563;
            }


            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                margin: 40px;
                color: #1f2937;
                line-height: 1.6;
                font-size: 14px;
            }

            h1 {
                text-align: center;
                font-size: 26px;
                margin-bottom: 5px;
            }

            .subtitle {
                text-align: center;
                font-size: 14px;
                color: #6b7280;
            }

            .generated-date {
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
                margin-bottom: 30px;
            }

            .section-title {
                font-size: 16px;
                font-weight: 600;
                border-bottom: 1px solid #d1d5db;
                padding-bottom: 6px;
                margin-top: 30px;
                margin-bottom: 15px;
            }

            .analysis-container {
                display: flex;
                justify-content: space-between;
                gap: 30px;
            }

            .analysis-left {
                flex: 2;
            }

            .analysis-right {
                flex: 1;
            }

            .user-image {
                width: 100%;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
            }

            .goal-item {
                margin-bottom: 6px;
            }

            .routine-container {
                display: flex;
            gap: 40px;
            }

            .routine-column {
                flex: 1;
            }

            .routine-column h3 {
                font-size: 15px;
                margin-bottom: 10px;
            }

            .product-step {
                margin-bottom: 14px;
            }

            .product-step strong {
                display: block;
            }

            .advice-container {
                display: flex;
                gap: 40px;
                margin-top: 10px;
            }

            .advice-column {
                flex: 1;
            }

            ul {
                padding-left: 18px;
            }

        .disclaimer {
            margin-top: 40px;
            font-size: 11px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }

        .prescription-item {
            page-break-inside: avoid;
        }


        </style>
        </head>

        <body>

            <div class="report-header">

                <div class="brand">
                    DERMATICS INDIA
                    <div class="brand-sub">Advanced AI Dermatology Report</div>
                </div>

                <div class="report-title">
                    ${reportTitle}
                </div>

                <div class="report-meta">
                    <div><strong>Report Type:</strong> Personalized Treatment Plan</div>
                    <div><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</div>
                </div>

            </div>


            <div class="section-title">AI Skin Analysis Findings</div>

            <div class="analysis-container">
                <div class="analysis-left">
                    ${analysisHtml}
                </div>
                <div class="analysis-right">
                    ${formattedUserImage ? `<img src="${formattedUserImage}" class="user-image" />` : ''}
                </div>
            </div>

            <div class="section-title">Your Skincare Goals</div>
            ${goals.length > 0
            ? goals.map(g => `<div class="goal-item">• ${g}</div>`).join('')
            : '<div class="goal-item">• Maintain healthy, balanced skin</div>'
        }

            <div class="section-title">Recommended Routine</div>

            <p style="font-size:13px; color:#4b5563;">
                Welcome to your personalized skincare journey! Based on your skin analysis, we’ve created a targeted routine designed to address your concerns effectively. Consistency and patience are key to visible results.
            </p>



            <div class="routine-container">
                <div class="routine-column">
                    <h3>AM Routine ☀️</h3>
                    ${generatePrescription(
            recommendations.find(r => r.category === 'Morning Routine')?.products || [],
            'AM'
        )}
                </div>

                <div class="routine-column">
                    <h3>PM Routine 🌙</h3>
                    ${generatePrescription(
            recommendations.find(r => r.category === 'Evening Routine')?.products || [],
            'PM'
        )}
                </div>
            </div>



            <div class="section-title">Additional Advice</div>

            <div class="advice-container">

                <div class="advice-column">
                    <strong>Key Ingredients</strong>
                    <ul>
                        ${ingredientsHtml}
                    </ul>
                </div>

                <div class="advice-column">
                    <strong>Lifestyle Tips</strong>
                    <ul>
                        <li>Maintain a balanced diet rich in antioxidants.</li>
                        <li>Stay hydrated by drinking adequate water daily.</li>
                        <li>Manage stress through meditation or exercise.</li>
                        <li>Change pillowcases regularly to reduce bacterial buildup.</li>
                        <li>Avoid picking active breakouts to prevent scarring.</li>
                    </ul>
                </div>

            </div>

            <div class="disclaimer">
            This skincare routine is a personalized AI-based recommendation. Individual results may vary. Always perform a patch test before introducing new products. Consult a dermatologist if irritation or adverse reactions occur. This is not a substitute for professional medical advice.
            </div>

            <script>
                window.onload = function() {
                setTimeout(() => { window.print(); }, 500);
                }
            </script>

        </body>
        </html>
`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};