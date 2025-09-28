export type KontakType = {
  id: string;
  list_kontak: ListKontakType[];
  created_at: string;
};

export type ListKontakType = {
  rilo_id: string;
  nama_kontak: string;
};
