เรียก Notification ได้จาก 

import { notifications } from "@mantine/notifications";

notifications.show({
title: "Saved",
message: "บันทึกข้อมูลเรียบร้อยแล้ว",
color: "teal",
});



เรียก Modal manager ได้จาก


import { modals } from "@mantine/modals";

modals.openConfirmModal({
  title: "ยืนยันการลบ",
  children: "คุณต้องการลบรายการนี้ใช่หรือไม่?",
  labels: { confirm: "ยืนยัน", cancel: "ยกเลิก" },
  confirmProps: { color: "red" },
  onConfirm: () => { /* ทำ action ลบ */ },
});