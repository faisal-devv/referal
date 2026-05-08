// Pre-trained Q&A knowledge base for the Referus.co support bot.
// Injected into the Gemini system prompt so answers are instant — no DB lookup needed.

const BOT_KNOWLEDGE = `
=== REFERUS.CO KNOWLEDGE BASE ===

Q: What is Referus.co?
A: Referus.co is a referral and networking platform that helps people connect individuals or businesses with verified partners and earn rewards on successful referrals.

Q: How does Referus.co work?
A: You submit a referral through the platform. Once the referral is successfully closed by one of the verified partners, you receive a reward based on the referral category and outcome.

Q: What kind of services are available on Referus.co?
A: Services may include: Credit Cards, Personal Loans, Home Mortgages, Insurance, Mutual Funds, IT / ERP Services, and Business & Corporate Leads. Availability may vary by country and partner network.

Q: Does Referus.co directly provide these services?
A: No. Referus.co does not directly provide or sell services/products. The platform connects users with verified and legally authorized channel partners and service providers who handle the actual processing, advisory, and service execution.

Q: How can I earn through Referus.co?
A: If you refer a person or company through the platform and the referral successfully closes with one of the verified partners, you receive a reward based on the referral category and outcome.

Q: Do I earn on every referral?
A: No. Rewards are applicable only on qualified and successfully closed referrals.

Q: What is considered a successful referral?
A: A successful referral is a lead that contains valid information, is genuinely interested, completes the required process, and successfully closes with the partner.

Q: How much can I earn?
A: Rewards vary depending on service category, referral quality, and successful completion of the case. Some categories may offer higher rewards than others.

Q: Is there any joining fee?
A: No, creating an account on Referus.co is completely free.

Q: Who can use Referus.co?
A: Professionals, consultants, freelancers, business owners, employees, and anyone with strong personal or professional networks can use the platform.

Q: Do I need sales experience?
A: No. You only need to refer potential clients or businesses. All advisory, processing, and closing activities are handled by verified partners.

Q: Can I refer companies as well as individuals?
A: Yes. You can refer both individuals and businesses depending on the service category.

Q: How do I submit a referral?
A: After signing in, select the service category, enter referral details, and submit the lead. The platform and partner team will handle the rest.

Q: Can I track my referrals?
A: Yes. You can track the status of your submitted referrals directly from your dashboard.

Q: What happens after I submit a lead?
A: The lead is reviewed and forwarded to the relevant verified partner for further processing.

Q: Will my client know I referred them?
A: While submitting a referral, you can choose whether your reference should be disclosed to the client, kept confidential, or the client should be contacted under another reference/name depending on the situation.

Q: Are the partners verified?
A: Yes. Referus.co works with verified, relevant, and legally authorized partners and service providers.

Q: Is Referus.co legal?
A: Referus.co operates as a referral and networking platform that connects users with verified partners. Service execution and advisory activities are handled by the respective licensed providers where applicable.

Q: Does Referus.co provide financial advice?
A: No. Referus.co does not provide investment or financial advice. Users are connected with licensed and verified partners for professional guidance.

Q: Is my data secure?
A: Referus.co aims to keep user and referral information secure and confidential.

Q: Why was my referral rejected?
A: A referral may be rejected if: information is incomplete, the client is not eligible, a duplicate submission exists, the case does not meet partner requirements, or the client decides not to proceed with the product or service.

Q: What happens if the deal does not close?
A: Rewards are applicable only on successfully closed referrals as per the partner process and referral category.

Q: How long does payout take?
A: Payout timelines may vary depending on the service category and partner confirmation process.

Q: Can I refer my own company or business?
A: Yes, depending on the service category and eligibility criteria.

Q: Can I use Referus.co outside UAE or Pakistan?
A: Service availability may depend on country coverage and partner network availability.

Q: How do I contact support?
A: You can contact the Referus.co support team directly through the platform contact section or support channels.

Q: How much commission/reward do I get for Credit Cards?
A: Rewards for credit card referrals may vary depending on the bank or partner, card category, approval status, and successful activation of the card. Applicable reward details are usually shared within the platform or during the referral process.

Q: How much can I earn from Personal Loan referrals?
A: Personal loan referral rewards depend on loan amount, partner policy, client eligibility, and successful disbursement of the loan. Reward structures may vary from case to case.

Q: Do different services offer different rewards?
A: Yes. Reward amounts may vary depending on service category, partner agreements, and referral outcome. Some categories may offer higher rewards than others.

Q: Is the reward fixed or percentage based?
A: Reward structures may vary depending on the service category and partner arrangement. Some referrals may have fixed rewards, while others may depend on the case type or successful outcome.

Q: When will I know my reward amount?
A: Reward details are generally confirmed once the referral progresses with the relevant partner and meets the required criteria.

Q: Can large business or corporate referrals offer higher rewards?
A: Yes. Certain corporate, IT, business, or high-value referrals may qualify for higher rewards depending on the project scope and successful closure.

Q: Why are rewards different for each category?
A: Different services have different partner structures, processing requirements, and commercial models, which may affect the applicable reward amount.

Q: Is there any minimum referral value required?
A: Minimum eligibility criteria may vary depending on the service category and partner requirements.

Q: Can I negotiate reward percentages?
A: No. Rewards and commission structures are managed according to the platform's policies, partner arrangements, and referral category. Applicable rewards are processed based on the predefined structure available for each service.

Q: Are rewards guaranteed?
A: Rewards are applicable only on qualified and successfully closed referrals according to partner policies and platform terms.

Q: How do I know I will receive my reward?
A: Referus.co maintains referral tracking and status updates within the platform. Once a referral is successfully completed and confirmed by the relevant partner, the applicable reward is processed according to the platform's policy and payout process. Transparency and long-term professional relationships are an important part of the platform's model.

Q: Can I earn without investment?
A: Yes. You do not need to invest your own money to use Referus.co. You can earn by referring individuals or businesses through the platform when eligible referrals successfully close with verified partners.

Q: Can students use Referus.co?
A: Yes. Students can also use Referus.co if they have personal, social, or professional networks that may benefit from the available services and opportunities on the platform.

Q: Do I need a license?
A: No. Users only refer potential clients or businesses through the platform. All advisory, processing, and service execution activities are handled by verified and legally authorized partners where applicable.

Q: Can I refer clients from outside UAE or Pakistan?
A: Yes. International referrals may also be accepted depending on the service category, country availability, and partner network coverage.

Q: How do I create an account?
A: You can create a free account on Referus.co within 2 minutes. Simply enter your email address, create a password, and your account will be ready.

Q: I forgot my password / How do I reset my password?
A: You can use the "Forgot Password" option on the login page to reset your password through your registered email address.

Q: How do I update my profile?
A: After logging into your account, go to your profile or account settings section where you can update your personal, professional, and contact information.

Q: How do I withdraw my earnings?
A: Your commission or reward is added to your wallet within the platform. You can request a withdrawal at any time, and once the withdrawal request is submitted, the payment is usually transferred within 48 working hours.

Q: Which account can I receive my payment in?
A: You can receive your payment in any account you prefer. Simply fill out the withdrawal request form and provide the account details where you want to receive the payment.

=== END OF KNOWLEDGE BASE ===
`;

module.exports = BOT_KNOWLEDGE;
