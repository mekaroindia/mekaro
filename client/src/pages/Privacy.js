import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";

const Privacy = () => {
    const sections = [
        {
            title: "SECTION 1 - WHAT DO WE DO WITH YOUR INFORMATION?",
            content: `When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as your name, address and email address.

When you browse our store, we also automatically receive your computer’s internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system.

Email marketing (if applicable): With your permission, we may send you emails about our store, new products and other updates.`
        },
        {
            title: "SECTION 2 - CONSENT",
            content: `How do you get my consent?

When you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange for a delivery or return a purchase, we imply that you consent to our collecting it and using it for that specific reason only.

If we ask for your personal information for a secondary reason, like marketing, we will either ask you directly for your expressed consent, or provide you with an opportunity to say no.

How do I withdraw my consent?

If after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued collection, use or disclosure of your information, at any time via replying to our mails or contacting us via call/whatsapp.`
        },
        {
            title: "SECTION 3 - DISCLOSURE",
            content: `We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service.`
        },
        {
            title: "SECTION 4 - THIRD-PARTY SERVICES",
            content: `In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us.

However, certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies in respect to the information we are required to provide to them for your purchase-related transactions.

All direct payment gateways adhere to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express and Discover.

PCI-DSS requirements help ensure the secure handling of credit card information by our store and its service providers.

For these providers, we recommend that you read their privacy policies so you can understand the manner in which your personal information will be handled by these providers.

In particular, remember that certain providers may be located in or have facilities that are located a different jurisdiction than either you or us. So if you elect to proceed with a transaction that involves the services of a third-party service provider, then your information may become subject to the laws of the jurisdiction(s) in which that service provider or its facilities are located.

Once you leave our store’s website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy or our website’s Terms of Service.`
        },
        {
            title: "SECTION 5 - SECURITY",
            content: `To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.`
        },
        {
            title: "SECTION 6 - COOKIES",
            content: `Like many websites, we use cookies and similar technologies to collect additional website usage data and to improve our Services, but we do not require cookies for many parts of our Services. A cookie is a small data file that is transferred to your computer's hard disk. Mekaro may use both session cookies and persistent cookies to better understand how you interact with our Services, to monitor aggregate usage by our users and web traffic routing on our Services, and to customize and improve our Services. Most Internet browsers automatically accept cookies. You can instruct your browser, by changing its settings, to stop accepting cookies or to prompt you before accepting a cookie from the websites you visit. However, some Services may not function properly if you disable cookies.`
        },
        {
            title: "SECTION 7 - CHANGES TO THIS PRIVACY POLICY",
            content: `We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.

If our store is acquired or merged with another company, your information may be transferred to the new owners so that we may continue to sell products to you.`
        },
        {
            title: "QUESTIONS AND CONTACT INFORMATION",
            content: `If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information contact our Privacy Compliance Officer at mekaro.india@gmail.com.`
        }
    ];

    return (
        <div className="privacy-page">
            <Navbar />
            <Container>
                <div className="privacy-container">
                    <h1 className="privacy-title">
                        Privacy Policy
                    </h1>

                    <div className="sections-list">
                        {sections.map((section, index) => (
                            <div key={index} className="privacy-section">
                                <h2 className="section-heading">{section.title}</h2>
                                {section.content.split('\n\n').map((paragraph, pIndex) => (
                                    <p key={pIndex} className="section-text">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
            <div className="footer-spacer">
                <Footer />
            </div>

            <style>{`
                .privacy-page {
                    background: var(--bg-darker);
                    min-height: 100vh;
                    color: var(--text-main);
                    display: flex; flex-direction: column;
                }
                .privacy-container { padding: 60px 0; }
                .privacy-title {
                    font-size: 40px; font-weight: 800; text-align: center; margin-bottom: 40px;
                    background: linear-gradient(to right, #fff, var(--primary));
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                .sections-list { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
                
                .privacy-section {
                    background: var(--bg-card); padding: 30px; border-radius: 20px;
                    border: 1px solid var(--glass-border);
                }
                .section-heading { font-size: 22px; font-weight: 700; margin-bottom: 16px; color: white; }
                .section-text {
                    color: var(--text-muted); line-height: 1.7; font-size: 15px; margin-bottom: 12px;
                }
                
                .footer-spacer { margin-top: auto; }

                /* MOBILE OVERRIDES */
                @media (max-width: 768px) {
                    .privacy-container { padding: 30px 0; }
                    .privacy-title { font-size: 28px; margin-bottom: 30px; }
                    .privacy-section { padding: 20px; border-radius: 16px; }
                    .section-heading { font-size: 18px; margin-bottom: 12px; }
                    .section-text { font-size: 14px; line-height: 1.6; }
                }
            `}</style>
        </div>
    );
};

export default Privacy;
