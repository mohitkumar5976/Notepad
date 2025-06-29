// components/Header.tsx
import * as React from "react";
import { Appbar, Menu } from "react-native-paper";

type HeaderProps = {
  title: string;
  onBack?: () => void;
};

export default function Header({ title, onBack }: HeaderProps) {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Appbar.Header>
      {onBack ? <Appbar.BackAction onPress={onBack} /> : null}
      <Appbar.Content title={title} />
      <Appbar.Action icon="magnify" onPress={() => console.log("Search")} />

      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon="dots-vertical" onPress={openMenu} />}
      >
        <Menu.Item onPress={() => console.log("Profile")} title="Profile" />
        <Menu.Item onPress={() => console.log("Settings")} title="Settings" />
        <Menu.Item onPress={() => console.log("Logout")} title="Logout" />
      </Menu>
    </Appbar.Header>
  );
}
