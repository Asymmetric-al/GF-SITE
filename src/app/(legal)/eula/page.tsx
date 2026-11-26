import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "End-User License Agreement (EULA) for the Global Fellowship Accounting web-based application.",
  robots: {
    follow: false,
    googleBot: {
      follow: false,
      index: false,
    },
    index: false,
  },
  title: "End-User License Agreement (EULA)",
};

const AccountingEulaPage = () => (
  <article className="gf-measure flex flex-col gap-6 text-sm leading-relaxed">
    <h1 className="gf-display-section text-foreground">
      End-User License Agreement (EULA)
    </h1>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        1. Introduction
      </h2>
      <p className="text-muted-foreground">
        This End-User License Agreement (&ldquo;Agreement&rdquo;) is a legal
        contract between you (&ldquo;User&rdquo; or &ldquo;you&rdquo;) and
        Global Fellowship (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) governing your use of the Global Fellowship
        Accounting web-based application (&ldquo;Software&rdquo;). By accessing
        or using the Software, you agree to be bound by the terms of this
        Agreement.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        2. Description of the Software
      </h2>
      <p className="text-muted-foreground">
        Global Fellowship Accounting is an online accounting application
        designed for small businesses and non-profit organizations. It helps
        Users track financial transactions and integrate certain data with
        third-party services, such as QuickBooks. Global Fellowship Accounting
        does not provide professional financial, tax, or legal advice; you
        remain responsible for meeting any local, state, or federal compliance
        requirements.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        3. License Grant
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Limited License: We grant you a non-exclusive, non-transferable,
          revocable license to access and use the Software in accordance with
          this Agreement.
        </li>
        <li>
          Restrictions: You may not sublicense, sell, lease, or otherwise
          redistribute the Software or any component thereof, except as
          expressly permitted by us.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        4. Permitted Uses
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Business and Non-Profit Bookkeeping: Use the Software to record
          transactions, generate reports, and manage accounting tasks.
        </li>
        <li>
          Integration with Approved Services: Integrate your Global Fellowship
          Accounting data with approved third-party services (e.g., QuickBooks)
          as made available through the Software&apos;s features.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        5. Prohibited Uses
      </h2>
      <p className="text-muted-foreground">You agree not to:</p>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>Use the Software for any unlawful or fraudulent activity.</li>
        <li>Modify, reverse-engineer, or decompile the Software.</li>
        <li>
          Attempt to circumvent any security features or access systems without
          authorization.
        </li>
        <li>Upload or transmit any viruses or malicious code.</li>
        <li>
          Resell or sublicense any portion of the Software to unapproved
          parties.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        6. Third-Party Services
      </h2>
      <p className="text-muted-foreground">
        Global Fellowship Accounting may integrate with or link to third-party
        services (such as QuickBooks). You acknowledge and agree that each
        third-party service has its own terms of use and privacy policies, which
        you must review and accept independently. We are not liable for the
        actions, omissions, or policies of any third-party service provider.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        7. User Responsibilities
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Accuracy of Financial Data: You are solely responsible for ensuring
          the accuracy and completeness of all financial data entered or
          uploaded into the Software.
        </li>
        <li>
          Compliance With Laws: You agree to comply with all applicable
          accounting, tax, and data protection laws in your jurisdiction.
        </li>
        <li>
          Security: Maintain the confidentiality of your login credentials. You
          are responsible for all activities that occur under your account.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        8. Intellectual Property Rights
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Ownership: Global Fellowship Accounting and its licensors retain all
          rights, title, and interest in and to the Software, including any
          related trademarks, service marks, and logos.
        </li>
        <li>
          Feedback: Any feedback or suggestions you provide may be used by us
          without obligation or restriction.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        9. Disclaimer of Warranties
      </h2>
      <p className="text-muted-foreground">
        THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
        AVAILABLE.&rdquo; TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, WE
        DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT
        LIMITED TO, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
        PURPOSE, NON-INFRINGEMENT, OR THAT THE SOFTWARE WILL BE ERROR-FREE OR
        UNINTERRUPTED.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        10. Limitation of Liability
      </h2>
      <p className="text-muted-foreground">
        IN NO EVENT WILL GF ACCOUNTING OR ITS AFFILIATES BE LIABLE FOR ANY
        INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
        INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED
        TO THIS AGREEMENT OR THE USE OF (OR INABILITY TO USE) THE SOFTWARE. OUR
        TOTAL LIABILITY FOR ANY CLAIM RELATING TO THIS AGREEMENT OR THE SOFTWARE
        SHALL NOT EXCEED THE AMOUNT YOU PAID, IF ANY, FOR ACCESS TO THE SOFTWARE
        DURING THE 12-MONTH PERIOD IMMEDIATELY PRECEDING THE EVENT GIVING RISE
        TO THE CLAIM.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        11. Termination
      </h2>
      <ul className="text-muted-foreground list-disc space-y-2 pl-5">
        <li>
          Termination by You: You may stop using the Software at any time.
        </li>
        <li>
          Termination by Us: We may terminate or suspend access to the Software
          if you breach this Agreement or if we discontinue the Software.
        </li>
        <li>
          Effect of Termination: Upon termination, all licenses granted under
          this Agreement will immediately end.
        </li>
      </ul>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        12. Changes to This Agreement
      </h2>
      <p className="text-muted-foreground">
        We may modify this Agreement from time to time. Any changes will be
        effective immediately upon posting in the Software or on our website. By
        continuing to use the Software, you agree to the revised terms.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        13. Governing Law
      </h2>
      <p className="text-muted-foreground">
        This Agreement will be governed by and construed in accordance with the
        laws of the jurisdiction in which GF Accounting is established, without
        regard to its conflict-of-law provisions.
      </p>
    </section>

    <section className="flex flex-col gap-2">
      <h2 className="text-foreground text-base font-semibold">
        14. Contact Us
      </h2>
      <p className="text-muted-foreground">
        If you have any questions or concerns about this Agreement or the
        Software, please contact us at:
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

export default AccountingEulaPage;
