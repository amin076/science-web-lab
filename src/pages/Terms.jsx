import { Box, Container, Divider, Link, Typography } from "@mui/material";

const Section = ({ title, children }) => (
  <Box component="section" sx={{ mb: 4 }}>
    <Typography variant="h5" fontWeight={800} gutterBottom>{title}</Typography>
    <Typography component="div" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
      {children}
    </Typography>
  </Box>
);

export default function Terms() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Typography variant="h3" fontWeight={900} gutterBottom>
        Esbiko Terms of Service
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Effective: 7 October 2026
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
        These terms apply to the Esbiko website, science simulations, and the
        Esbiko Science Lab integration for ChatGPT and other MCP-compatible
        clients.
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Section title="Educational purpose">
        <p>
          Esbiko provides interactive science and educational software.
          Simulations are designed for learning, exploration, demonstration,
          and experimentation. They are not a substitute for professional
          engineering, medical, legal, safety-critical, or other regulated
          advice.
        </p>
      </Section>

      <Section title="Using the service">
        <p>
          You may use Esbiko for lawful educational and research purposes.
          You must not misuse the service, attempt to disrupt its
          infrastructure, bypass security controls, or use automated access in
          a way that materially harms the service or other users.
        </p>
      </Section>

      <Section title="Scientific results">
        <p>
          We work to make calculations and simulations accurate and useful,
          but models necessarily involve assumptions, approximations, and
          implementation limits. Verify results independently before relying
          on them for safety-critical or professional decisions.
        </p>
      </Section>

      <Section title="AI and MCP interactions">
        <p>
          When Esbiko is used through ChatGPT or another MCP-compatible client,
          the client may choose Esbiko tools and supply structured parameters
          on your behalf. Esbiko validates supported parameters and capabilities
          but cannot control how third-party clients phrase their surrounding
          responses.
        </p>
        <p>
          Browser-restricted capabilities such as audio, recording, downloads,
          AR, or VR may require a direct user gesture or supported hardware.
          A prepared operation is not complete until the relevant browser
          action succeeds.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          Esbiko software, branding, original simulations, educational
          materials, and interface content are protected by applicable
          intellectual-property rights. Third-party libraries, models, media,
          or data remain subject to their respective licenses and rights.
        </p>
      </Section>

      <Section title="Availability and changes">
        <p>
          Esbiko may change, improve, suspend, or discontinue features. We may
          update simulation models, MCP tools, user interfaces, and supported
          capabilities as the platform evolves.
        </p>
      </Section>

      <Section title="Warranty and liability">
        <p>
          To the extent permitted by law, Esbiko is provided on an "as is" and
          "as available" basis without guarantees of uninterrupted availability
          or error-free operation. Nothing in these terms excludes rights or
          remedies that cannot lawfully be excluded.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms can be sent through{" "}
          <Link href="https://www.esbiko.com/contact">
            https://www.esbiko.com/contact
          </Link>.
        </p>
      </Section>
    </Container>
  );
}
