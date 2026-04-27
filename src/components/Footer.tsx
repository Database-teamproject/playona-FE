const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="max-w-3xl mx-auto text-center text-xs text-muted-foreground">
        © {year} Playona
      </div>
    </footer>
  );
};

export default Footer;
