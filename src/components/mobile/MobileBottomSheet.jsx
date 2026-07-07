import MobileDrawer from "./MobileDrawer";

export default function MobileBottomSheet({
  children,
  height = "min(78dvh, 640px)",
  paperSx = {},
  ...props
}) {
  return (
    <MobileDrawer
      anchor="bottom"
      width="100%"
      paperSx={{
        height,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        pt: 0,
        pr: "var(--esbiko-safe-right, 0px)",
        pl: "var(--esbiko-safe-left, 0px)",
        ...paperSx,
      }}
      {...props}
    >
      {children}
    </MobileDrawer>
  );
}
