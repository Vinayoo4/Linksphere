import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Link, Pdf, News, Alert, Group } from '../types';

interface LinksState {
  links: Link[];
  pdfs: Pdf[];
  news: News[];
  alerts: Alert[];
  groups: Group[];
  
  // Setters for bulk updates
  setLinks: (links: Link[]) => void;
  setPdfs: (pdfs: Pdf[]) => void;
  setNews: (news: News[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setGroups: (groups: Group[]) => void;
  
  // Links
  addLink: (link: Link) => void;
  updateLink: (link: Link) => void;
  removeLink: (id: string) => void;
  
  // PDFs
  addPdf: (pdf: Pdf) => void;
  updatePdf: (pdf: Pdf) => void;
  removePdf: (id: string) => void;
  
  // News
  addNews: (news: News) => void;
  updateNews: (news: News) => void;
  removeNews: (id: string) => void;
  
  // Alerts
  addAlert: (alert: Alert) => void;
  updateAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  
  // Groups
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  removeGroup: (id: string) => void;
}

export const useLinks = create<LinksState>()(
  persist(
    (set) => ({
      links: [],
      pdfs: [],
      news: [],
      alerts: [],
      groups: [],
      
      // Bulk setters
      setLinks: (links) => set({ links }),
      setPdfs: (pdfs) => set({ pdfs }),
      setNews: (news) => set({ news }),
      setAlerts: (alerts) => set({ alerts }),
      setGroups: (groups) => set({ groups }),
      
      // Links
      addLink: (link) => set((state) => ({ 
        links: [...state.links, link] 
      })),
      updateLink: (updatedLink) => set((state) => ({
        links: state.links.map(link => 
          link.id === updatedLink.id ? updatedLink : link
        )
      })),
      removeLink: (id) => set((state) => ({ 
        links: state.links.filter(link => link.id !== id) 
      })),
      
      // PDFs
      addPdf: (pdf) => set((state) => ({ 
        pdfs: [...state.pdfs, pdf] 
      })),
      updatePdf: (updatedPdf) => set((state) => ({
        pdfs: state.pdfs.map(pdf => 
          pdf.id === updatedPdf.id ? updatedPdf : pdf
        )
      })),
      removePdf: (id) => set((state) => ({ 
        pdfs: state.pdfs.filter(pdf => pdf.id !== id) 
      })),
      
      // News
      addNews: (newsItem) => set((state) => ({ 
        news: [...state.news, newsItem] 
      })),
      updateNews: (updatedNews) => set((state) => ({
        news: state.news.map(item => 
          item.id === updatedNews.id ? updatedNews : item
        )
      })),
      removeNews: (id) => set((state) => ({ 
        news: state.news.filter(item => item.id !== id) 
      })),
      
      // Alerts
      addAlert: (alert) => set((state) => ({ 
        alerts: [...state.alerts, alert] 
      })),
      updateAlert: (updatedAlert) => set((state) => ({
        alerts: state.alerts.map(alert => 
          alert.id === updatedAlert.id ? updatedAlert : alert
        )
      })),
      removeAlert: (id) => set((state) => ({ 
        alerts: state.alerts.filter(alert => alert.id !== id) 
      })),
      
      // Groups
      addGroup: (group) => set((state) => ({ 
        groups: [...state.groups, group] 
      })),
      updateGroup: (updatedGroup) => set((state) => ({
        groups: state.groups.map(group => 
          group.id === updatedGroup.id ? updatedGroup : group
        )
      })),
      removeGroup: (id) => set((state) => ({ 
        groups: state.groups.filter(group => group.id !== id) 
      })),
    }),
    {
      name: 'links-storage',
    }
  )
);