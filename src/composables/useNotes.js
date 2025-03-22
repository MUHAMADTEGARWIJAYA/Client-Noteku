import { useQuery } from '@tanstack/vue-query'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import axiosInstance from '@/utils/axiosInstance' // Import axiosInstance

export function useNotes() {
  const queryClient = useQueryClient(); // Tambahkan ini
  const { data, isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/note/dapatsemua')
      return response.data
    },

    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,

  });

  const refreshNotes = async () => {
    await queryClient.invalidateQueries(['notes']);
  };
  return { data, isLoading, error, refreshNotes };
}



export function useName() {
  return useQuery({
    queryKey: ['name'],
    queryFn: async () => {
      const response = await axiosInstance.get('/auth/name')
      return response.data
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })
}

export function getNoteId(id) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/note/dapat/${id}`)
      return response.data
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title, content }) => {
      const response = await axiosInstance.put(`/note/update/${id}`, { title, content });
      return response.data;
    },
    onMutate: async (updatedNote) => {
      await queryClient.cancelQueries(['notes']);

      const previousNotes = queryClient.getQueryData(['notes']);

      queryClient.setQueryData(['notes'], (oldNotes) => {
        return oldNotes.map(note =>
          note._id === updatedNote.id ? { ...note, title: updatedNote.title, content: updatedNote.content } : note
        );
      });

      return { previousNotes };
    },
    onError: (err, newNote, context) => {
      // Rollback jika gagal
      queryClient.setQueryData(['notes'], context.previousNotes);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['notes']);
    }
  });
}


export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newNote) => {
      const response = await axiosInstance.post('/note/create', newNote);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['notes']);
    }
  });
}



export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/note/delete/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['notes']);
    }
  });
}
