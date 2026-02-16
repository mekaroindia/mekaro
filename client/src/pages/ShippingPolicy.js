import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";

const ShippingPolicy = () => {
    const sections = [
        {
            title: "Shipping",
            content: `Upon order confirmation and availability of stocks, most orders placed before 3 pm IST will be shipped on the same day (excluding Sundays and Public holidays) through our shipping partners. In rare cases, the pickup may get delayed during Public holidays/Bandh/Environmental disturbances.

To ensure that your order reaches you in the fastest time and in good condition, we only ship through reputed courier agencies. Our primary shipping partners are BlueDart, Delhivery, DTDC and Shree Maruthi Courier. If your pin code is not serviceable by BlueDart, DTDC, Delhivery and Shree Maruthi, we will be shipping through Indian Speed Post.

To track your order status, we we will share the tracking details on your registered mail ID once the order has been shipped from our warehouse.

Delivery time varies based on your location. Ideally, for all metropolitan cities it takes 1-3 days and for other cities it may take upto 3-7 days. The time quoted is the best possible time. It will completely depend upon the courier service to deliver the parcels on time. In case of any delays due to a third-party carrier, Robocraze will not be responsible for your losses, if any.

Please note all items (including gifts) will be shipped with an invoice mentioning the price, as per Indian Tax Regulations.

If you believe that the product is not in good condition, or if the packaging is tampered with or damaged before accepting your delivery of the goods, please refuse to take delivery of the package, and contact us on +91-8123057137 or raise a ticket on Support mentioning your order reference number. We shall make our best efforts to ensure that a replacement delivery is made to you at the earliest.`
        },
        {
            title: "GST Invoicing",
            content: `As per the latest Government mandate, generating an e-invoice on Govt NIC portal is now mandatory. Hence, if you need a GST input, please fill your GST details on the cart page during checkout. If missed, GST details cannot be updated later manually.
Unfortunately, we shall not be able to entertain any modification requests once the order has been placed.`
        },
        {
            title: "Cash on Delivery (COD)",
            content: `Robocraze offers cash on delivery (COD) payment option only for online orders worth Rs 500/- and above but below Rs.3000/-.

A nominal fee of Rs.125/- is charged as processing fee for all COD orders.

COD may not be available in some pin-codes, in such cases we request you to choose Prepaid and place an order online. All COD orders are shipped only after a confirmation call to customer and after the successful delivery of the previous order from the same customer, otherwise the order will be automatically canceled. To ensure timely processing and dispatch of your order, please receive calls from ‘Robocraze’. In case the customer does not answer the call, we will notify you about your order cancelation through an email. Please e-mail or call us at the earliest, in case you would like to confirm your order.`
        },
        {
            title: "Free Shipping",
            content: `We offer free shipping on all orders worth Rs.500/- and more for all states within India, with the exception of deliveries to Jammu and Kashmir and North East states (Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura) of India.
Customers from these regions will be charged a nominal shipping fee for the delivery. Shipping costs will be calculated and displayed at the time of checkout.`
        },
        {
            title: "Cancellation/Returns",
            content: `A Customer has to inform about the cancellation of the product by raising a ticket on Support or call us on our IVR number +91-8123057137 or contact our customer support team via website chat option BEFORE the order has been shipped. There won’t be any cancellation if the product has been already shipped.

After the confirmation of the order, If any unexpected shortage of inventory or any other inventory issues or shipping issue arises, we may not be able to ship the product. Your order will be auto-canceled and the full amount will be refunded to your original source of payment. The Buyer can also request to Buy any other product available on the website.

Our Return Policy lasts for 7 days from the date of receipt of the consignment due to the sensitive nature of the products, if unless mentioned otherwise on the product page. If 7 days have gone by since the product was delivered, a refund or exchange would not be acknowledged, and the Management decision would be final.

Only defective/damaged products will be accepted for returns/refunds.

To return the product, please raise a ticket to our customer support team on support.robocraze.com requesting a return or contact us via website chat option with your order ID. Our tech team will then inspect the case and understand if the product is faulty and confirm the condition of the product. Upon confirmation from our tech team, the customer support team will contact you for a return, please ship the product back to our office only in original packing. Once we receive the item and upon team confirmation that it arrived in original packing with all the original parts/components/contents/accessories then refund/replacement will be initiated.

Any repair or replacement of defective parts will be charged to the Customer, If the fault is due to accident, misuse, negligence, and willful Damage by the Customer.

You will be responsible for paying for your shipping costs for returning your item. Shipping costs are non-refundable.`
        },
        {
            title: "Refund/Replacement",
            content: `Once your return is received and inspected, we shall process the refund/notify you of the rejection of your refund. In case of a refund, a credit will automatically be made via UPI/NEFT, within 3-4 working days of approval.

If you haven’t received a refund within 3-4 working days, please check with your Credit/Debit Card Company or your Bank. There is often a processing time before a refund is made. In case you still are unsure about your refund, contact us at care@robocraze.com.

Replacement is not acceptable for Raspberry Pi, Arduino Original, Jetson Nano, BeagleBone, Micro:Bit, and SeeedStudio products. Also, if the product is not returned in original packing or it exceeds the return period, replacement request will be cancelled.

Replacement/Return requests will not be entertained for products that are marked as non-returnable on the product page.

We make an exception to our return policy for the following cases by collecting nominal processing charges: if the item was ordered in error, if the requirement has changed or no longer exists, if the specifications do not align with your project, in case of unintentional purchase, or due to delays in delivery. We will arrange for a return pickup after a processing charge of Rs 150/- has been paid through the link shared via email. Upon receiving the item at our warehouse and an inspection that the product has not been damaged at customer end, we will make a complete refund of your purchased item to your original mode of payment of order placement. Please note that shipping charges and processing charges are non-refundable, under any circumstances.

In cases where a customer (same email id/same GST number/same contact number) places multiple orders for a product with quantity limits, all extra units will be automatically cancelled. The refund will be issued after a 2% deduction as payment gateway fees. Alternatively, customer can choose to keep the balance as Robocraze Credits or buy other products from our store, in which case the 2% deduction will not be done.`
        },
        {
            title: "Warranty",
            content: `A manufacturer warranty of 1 year is applicable on Raspberry Pi Original boards and Arduino Original products from the date of purchase. The warranty doesn't include items broken or damaged or any shot of physical damage.

Warranty is void If the product is damaged after delivery by an accident, natural calamities, mishandling, failure to follow operational instructions, exposure to rain, water, or heavy moisture-laden conditions, repaired by unauthorized persons, storage near any heat source or in direct sunlight for an extended period time, improper safe keeping or other acts of God.

If the Warranty is void for the above-mentioned reasons or any other reason that the Robocraze representative feels so, the customer will not be entitled to a refund or replacement. In case of any dispute, Robocraze’s decision shall be final and binding.`
        },
        {
            title: "Late or missing refunds",
            content: `If you haven’t received a refund within 10 days, please check with your Credit/Debit Card Company or your Bank. There is often a processing time before a refund is made. In case you still are unsure about your refund, contact us at connect@robocraze.com.`
        },
        {
            title: "Loyalty Points(RC Coins)",
            content: `The redemption of Robocraze coins (RC Coins) is not applicable during Robocraze sale days and special occasions.`
        },
        {
            title: "Authorized Payment Methods",
            content: `All payments to be made directly on the website, or via below methods to official TIF Labs/Robocraze bank accounts only.

1. Account Transfer
   i. Primary Account
      Name: TIF Labs Private Limited
      HSBC A/c No: 073690760001
      IFSC Code: HSBC0560002
      MICR: 560039002
      Branch: MG Road, Bangalore

   ii. Secondary Account
      Name: TIF Labs Private Limited
      HDFC A/c No: 50200026263451
      IFSC Code: HDFC0001759
      Branch: OMBR Layout, Bangalore

2. Cheque Payments: Cheques to be issued only in the name of TIF LABS Pvt Ltd and deposited in the above accounts or sent to the following address via registered mail:
   Robocraze, Ground Floor, 912/10 Survey no. 104 4th G street, Chelekare, Kalyan Nagar, Bengaluru - 560043

3. QR Payments to UPI ID: 9100088099@okbizaxis`
        },
        {
            title: "SECTION 18 - GOVERNING LAW",
            content: `These terms of service and any separate agreements whereby we provide you Services shall be governed by and constructed in accordance with the laws of Robocraze.`
        }
    ];

    return (
        <div className="policy-page">
            <Navbar />
            <Container>
                <div className="policy-container">
                    <h1 className="policy-title">
                        Shipping & Returns Policy
                    </h1>

                    <div className="sections-list">
                        {sections.map((section, index) => (
                            <div key={index} className="policy-section">
                                <h2 className="section-heading">{section.title}</h2>
                                {section.content.split('\n\n').map((paragraph, pIndex) => (
                                    <p key={pIndex} className="section-text" style={{ whiteSpace: "pre-line" }}>
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="policy-footer-note">
                        Hope you would have a pleasant shopping experience with us. You can always write to us at care@robocraze.com.
                    </div>
                </div>
            </Container>
            <div className="footer-spacer">
                <Footer />
            </div>

            <style>{`
                .policy-page {
                    background: var(--bg-darker);
                    min-height: 100vh;
                    color: var(--text-main);
                    display: flex; flex-direction: column;
                }
                .policy-container { padding: 60px 0; }
                .policy-title {
                    font-size: 40px; font-weight: 800; text-align: center; margin-bottom: 40px;
                    background: linear-gradient(to right, #fff, var(--primary));
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                .sections-list { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
                
                .policy-section {
                    background: var(--bg-card); padding: 30px; border-radius: 20px;
                    border: 1px solid var(--glass-border);
                }
                .section-heading { font-size: 22px; font-weight: 700; margin-bottom: 16px; color: white; }
                .section-text {
                    color: var(--text-muted); line-height: 1.7; font-size: 15px; margin-bottom: 12px;
                }
                
                .policy-footer-note {
                    text-align: center; margin-top: 40px; color: var(--text-muted); font-style: italic;
                }

                .footer-spacer { margin-top: auto; }

                /* MOBILE OVERRIDES */
                @media (max-width: 768px) {
                    .policy-container { padding: 30px 0; }
                    .policy-title { font-size: 28px; margin-bottom: 30px; }
                    .policy-section { padding: 20px; border-radius: 16px; }
                    .section-heading { font-size: 18px; margin-bottom: 12px; }
                    .section-text { font-size: 14px; line-height: 1.6; }
                }
            `}</style>
        </div>
    );
};

export default ShippingPolicy;
