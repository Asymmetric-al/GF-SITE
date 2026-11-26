import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Privacy Policy for the Global Fellowship Accounting web-based application.",
  robots: {
    follow: false,
    googleBot: {
      follow: false,
      index: false,
    },
    index: false,
  },
  title: "Privacy Policy (Global Fellowship Accounting)",
};

const AccountingPrivacyPolicyPage = () => (
  <article className="gf-measure flex flex-col gap-6 text-sm leading-relaxed">
    <h1 className="gf-display-section text-foreground">Privacy Policy</h1>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        1. Introduction
      </h2>
      <p className="text-muted-foreground">
        This Privacy Policy explains how Global Fellowship Accounting
        (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects,
        uses, stores, and shares information when you use our web-based
        accounting application (&ldquo;Service&rdquo;). By using the Service,
        you consent to the practices described in this Policy.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        2. Data We Collect
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Account Information: Such as your name, email address, and
          business/non-profit details you provide when signing up.
        </li>
        <li>
          Financial Data: This may include transaction details, invoices,
          receipts, and other accounting-related data uploaded or generated
          through the Service.
        </li>
        <li>
          Usage Information: Log files, device information, and analytics data
          (e.g., browser type, IP address) that help us improve the Service.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        3. How We Use Collected Data
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          To Provide and Maintain the Service: We use your financial and account
          data to enable bookkeeping features and related functionality.
        </li>
        <li>
          To Improve the Service: We analyze usage patterns and troubleshoot
          performance issues.
        </li>
        <li>
          To Communicate With You: We send updates, notifications, and other
          information related to your account or features that might interest
          you.
        </li>
        <li>
          For Legal Compliance: We may use your data to comply with applicable
          laws, regulations, or legal requests.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        4. Data Storage and Security
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Storage on Google Firebase: We store your data on Google Firebase
          servers. Firebase employs its own security measures to protect your
          data at rest and in transit.
        </li>
        <li>
          Encryption: Certain sensitive data may be encrypted to prevent
          unauthorized access.
        </li>
        <li>
          Internal Access Controls: Only authorized personnel with a legitimate
          need can access sensitive data.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        5. Third-Party Data Sharing
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Integrations With QuickBooks: If you choose to link your QuickBooks
          account, data may be shared with Intuit. Intuit has its own privacy
          policies, which you should review.
        </li>
        <li>
          Service Providers: We may share information with trusted third parties
          who help us operate the Service (e.g., hosting providers, analytics
          tools), but they are obligated to handle your data securely and
          confidentially.
        </li>
        <li>
          Legal Obligations: We may disclose your data if required by law,
          subpoena, or judicial proceeding, or if we believe it is necessary to
          protect our rights or the rights of others.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        6. Data Retention
      </h2>
      <p className="text-muted-foreground">
        We retain your data for as long as your account is active or as needed
        to provide the Service. We may also retain data for a reasonable period
        after account closure if necessary to comply with legal obligations or
        resolve disputes.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        7. Data Deletion and Account Closure
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Requesting Deletion: You can request deletion of your account and
          associated data by contacting us at contact@globalfellowship.org.
        </li>
        <li>
          Processing Time: We will respond to your request within a reasonable
          timeframe, subject to any legal or contractual obligations that
          require continued data retention.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        8. Your Choices and Rights
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Access and Updates: You can access and update your account information
          at any time by logging into your account settings.
        </li>
        <li>
          Opt-Out: You may opt out of certain communications by using the
          unsubscribe link or contacting us directly.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        9. Changes to This Privacy Policy
      </h2>
      <p className="text-muted-foreground">
        We may update this Policy from time to time. Any changes will be posted
        within the Service or on our website, and your continued use of the
        Service constitutes acceptance of these changes.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        10. Contact Us
      </h2>
      <p className="text-muted-foreground">
        If you have questions about this Privacy Policy, or wish to make a
        complaint, please contact us at:
      </p>
      <p className="text-foreground">
        Email:{" "}
        <a
          className="text-primary underline underline-offset-4"
          href="mailto:contact@globalfellowship.org"
        >
          contact@globalfellowship.org
        </a>
      </p>
    </section>
  </article>
);

export default AccountingPrivacyPolicyPage;
