import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PolicySection {
  id: number;
  title: string;
  content: string;
  open: boolean;
}

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  lastUpdated = '17 January 2026';
  allOpen = false;

  sections: PolicySection[] = [
    {
      id: 1,
      title: 'Information We Collect',
      open: false,
      content: `We collect personal information when you interact with our website, including:
• Personal Identification Information — your name, email address, phone number, billing address, or other details you provide when filling out forms or contacting us.
• Usage Data — information about how you access and use our website, including your IP address, browser type, device type, and activity on the site.
• Cookies and Tracking Technologies — we use cookies, web beacons, and similar technologies to collect and store information about your browsing behaviour.`
    },
    {
      id: 2,
      title: 'How We Use Your Information',
      open: false,
      content: `We use the information we collect to:
• Provide, maintain, and improve our services.
• Personalise your experience and respond to your requests.
• Communicate with you, including sending transactional emails or responding to customer support enquiries.
• Process payments and complete transactions.
• Monitor and analyse trends and usage to improve our website.
• Comply with legal obligations and protect our rights.`
    },
    {
      id: 3,
      title: 'Sharing Your Information',
      open: false,
      content: `We do not sell or rent your personal information to third parties. We may share your information in these situations:
• Service Providers — third-party providers that assist us in operating our website, processing payments, or providing customer support.
• Legal Requirements — if required by law or to respond to legal processes, including court orders or regulatory enquiries.
• Business Transfers — if we merge with or are acquired by another company, your information may be transferred as part of the transaction.`
    },
    {
      id: 4,
      title: 'Security of Your Information',
      open: false,
      content: `We implement appropriate technical and organisational security measures to protect the personal information we collect. While we strive to protect your data, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.`
    },
    {
      id: 5,
      title: 'Your Data Protection Rights',
      open: false,
      content: `Depending on where you live, you may have the following rights:
• Access — request access to the personal data we hold about you.
• Correction — request corrections to any inaccurate or incomplete data.
• Deletion — request that we delete your personal information under certain conditions.
• Opt-out of Marketing — unsubscribe from marketing communications at any time.
• Data Portability — request that we transfer your data to another provider in a machine-readable format.

To exercise any of these rights, contact us`
    },
    {
      id: 6,
      title: 'Third-Party Links',
      open: false,
      content: `Our website may contain links to third-party websites or services not owned or controlled by us. We are not responsible for the privacy practices or content of third-party sites. We encourage you to review the privacy policies of any third-party services you visit.`
    },
    {
      id: 7,
      title: 'Cookies and Tracking Technologies',
      open: false,
      content: `We use cookies and similar technologies to enhance your browsing experience and analyse site traffic. Cookies are small files placed on your device that allow us to recognise your browser and capture certain information. You can control cookies through your browser settings, but disabling them may impact your experience.`
    },
    {
      id: 8,
      title: 'Ticket Purchase Terms & Conditions',
      open: false,
      content: `By purchasing a ticket you agree to the following:
• Non-Refundable Sales — all ticket sales are final. Tickets cannot be refunded or exchanged under any circumstances.
• Event Date & Time — tickets are valid only for the specific event date and time listed at purchase.
• Changes to Event — tickets remain valid for any rescheduled date or new venue unless otherwise specified.
• Lost or Stolen Tickets — we are not responsible for lost, stolen, or damaged tickets. Replacements will not be issued.
• Admission — the event organisers reserve the right to refuse entry or remove any attendee for violation of event policies.
• Liability — by purchasing a ticket you acknowledge and accept any risks associated with attending the event.
• Privacy — you consent to the use of your personal information for event-related purposes including updates and communications.
• Changes to Terms — the event organisers reserve the right to modify these terms at any time without prior notice.`
    },
    {
      id: 9,
      title: "Children's Privacy",
      open: false,
      content: `Our website is not intended for children under the age of 13, and we do not knowingly collect personal information from children. If we learn that we have collected personal information from a child under 13, we will take steps to delete such information promptly.`
    },
    {
      id: 10,
      title: 'Changes to This Privacy Policy',
      open: false,
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices or for legal or regulatory reasons. When we make changes, we will update the "Last Updated" date at the top of this policy. We encourage you to review this Privacy Policy periodically.`
    },
    {
      id: 11,
      title: 'Contact Us',
      open: false,
      content: `If you have any questions or concerns about this privacy policy or our practices, please contact us`
    }
  ];

  toggle(section: PolicySection): void {
    section.open = !section.open;
  }

  toggleAll(): void {
    this.allOpen = !this.allOpen;
    this.sections.forEach(s => s.open = this.allOpen);
  }

  get openCount(): number {
    return this.sections.filter(s => s.open).length;
  }
}