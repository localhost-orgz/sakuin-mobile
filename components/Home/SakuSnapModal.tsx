import SakuSnapSourceSheet from "@/components/SakuSnap/SakuSnapSourceSheet";
import React from "react";

const SakuSnapModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => <SakuSnapSourceSheet visible={visible} onClose={onClose} />;

export default SakuSnapModal;
