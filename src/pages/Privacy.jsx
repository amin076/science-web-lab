import { Box, Container, Divider, Link, Typography } from "@mui/material";

const Section = ({ title, children }) => (
  <Box component="section" sx={{ mb: 4 }}>
    <Typography variant="h5" fontWeight={800} gutterBottom>{title}</Typography>
    <Typography component="div" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
      {children}
    </Typography>
  </Box>
);

export default function Privacy() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Typography variant="h3" fontWeight={900} gutterBottom>
        Esbiko Privacy Policy
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Effective: 7 October 2026
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
        This policy explains how Esbiko handles information when you use the
        Esbiko website, interactive simulations, and the Esbiko Science Lab
        integration for ChatGPT and other MCP-compatible clients.
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Section title="Information we process">
        <p>
          Most public science simulations do not require an Esbiko account.
          When an MCP client calls an Esbiko simulation tool, Esbiko receives
          only the structured tool arguments needed to perform that request,
          such as a simulation identifier and scientific parameter values.
          Esbiko does not require your full ChatGPT conversation to run these
          public simulation tools.
        </p>
        <p>
          If you use account features on the Esbiko website, Esbiko may process
          account information you provide, such as your email address and
          profile information. If you contact Esbiko, we process the contact
          details and message you choose to send.
        </p>
        <p>
          Our hosting and infrastructure providers may process technical logs
          needed for security, reliability, debugging, and abuse prevention,
          such as request time, network/service metadata, error details, and
          similar operational information.
        </p>
      </Section>

      <Section title="How we use information">
        <p>
          We use information to run requested simulations and calculations,
          provide account or support features when requested, secure and
          operate the service, diagnose failures, improve reliability, and
          comply with applicable legal obligations.
        </p>
        <p>
          Esbiko does not sell personal information to advertisers and does
          not require personal profile information for the public MCP science
          simulation tools.
        </p>
      </Section>

      <Section title="Service providers and recipients">
        <p>
          Esbiko uses infrastructure and service providers necessary to
          operate the product, including Google Cloud/Firebase for hosting and
          backend infrastructure. When you invoke Esbiko through ChatGPT or
          another MCP client, that client sends the selected tool request to
          Esbiko under the client provider's own privacy terms.
        </p>
        <p>
          We may also disclose information when required by law, or when
          reasonably necessary to protect users, the service, or the public.
        </p>
      </Section>

      <Section title="Retention">
        <p>
          Public MCP simulation inputs are not intended to become permanent
          user profiles. Operational server and diagnostic logs may be retained
          for up to 30 days unless a longer period is required for security,
          abuse investigation, legal compliance, or incident response.
        </p>
        <p>
          Account information is retained while an account is active and as
          reasonably necessary to provide the service or meet legal
          obligations. Support messages may be retained while needed to resolve
          the request and maintain reasonable business records.
        </p>
      </Section>

      <Section title="Your choices and controls">
        <p>
          You can use the public science simulations without providing an
          Esbiko account unless a specific website feature clearly states that
          sign-in is required. You can request access, correction, or deletion
          of personal information associated with Esbiko by contacting us.
        </p>
        <p>
          You can also stop using the ChatGPT plugin or disconnect it through
          the controls provided by the client.
        </p>
      </Section>

      <Section title="Children and education">
        <p>
          Esbiko provides educational science content. The public MCP
          integration is designed to minimize personal-data collection. Where
          schools, teachers, students, or guardians use account-based
          educational features, they should use those features in accordance
          with applicable school policies and local privacy requirements.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this policy as Esbiko's services change. Material
          changes will be reflected on this page with an updated effective
          date.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions or privacy requests can be sent through the Esbiko contact
          page at{" "}
          <Link href="https://www.esbiko.com/contact">
            https://www.esbiko.com/contact
          </Link>.
        </p>
      </Section>
    </Container>
  );
}
