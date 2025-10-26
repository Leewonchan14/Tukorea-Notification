const MAJOR_LIST = [
  {
    name: "모든 학과",
    value: "ALL_MAJOR",
    discord: "...",
  },
  {
    name: "게임공학과",
    value: "GAME_ENGINEERING",
    discord: "...",
  },
  {
    name: "인공지능학과",
    value: "AI",
    discord: "...",
  },
  {
    name: "컴퓨터공학부",
    value: "COMPUTER_ENGINEERING",
    discord: "...",
  },
  {
    name: "전자공학부",
    value: "ELECTRONIC_ENGINEERING",
    discord: "...",
  },
  {
    name: "반도체공학부",
    value: "SEMICONDUCTOR_ENGINEERING",
    discord: "...",
  },
  {
    name: "기계공학과",
    value: "MECHANICAL_ENGINEERING",
    discord: "...",
  },
  {
    name: "기계설계공학부",
    value: "MECHANICAL_DESIGN_ENGINEERING",
    discord: "...",
  },
  {
    name: "메카트로닉스공학부",
    value: "MECHATRONICS_ENGINEERING",
    discord: "...",
  },
  {
    name: "신소재공학과",
    value: "NEW_MATERIAL_ENGINEERING",
    discord: "...",
  },
  {
    name: "생명화학공학과",
    value: "BIOCHEMICAL_ENGINEERING",
    discord: "...",
  },
  {
    name: "에너지ㆍ전기공학부",
    value: "ENERGY_ELECTRICAL_ENGINEERING",
    discord: "...",
  },
  {
    name: "경영학부",
    value: "BUSINESS_ENGINEERING",
    discord: "...",
  },
  {
    name: "디자인공학부",
    value: "DESIGN_ENGINEERING",
    discord: "...",
  },
  {
    name: "지식융합학부",
    value: "KNOWLEDGE_INTEGRATION_ENGINEERING",
    discord: "...",
  },
] as const;

const WEBHOOK_MAP = {
  ...Object.fromEntries(
    MAJOR_LIST.map((major) => [major.value, major.discord])
  ),

  DORMITORY_NOTICE_WEBHOOK: "...",
  SCHOOL_MEAL_WEBHOOK: "...",
  SHUTTLE_WEBHOOK: "...",
  ERROR_WEBHOOK: "...",
};
