import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/admin/sidebar';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Sidebar Component', () => {
  it('renders admin links correctly', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin');
    
    render(<Sidebar />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/admin');
    
    const postsLink = screen.getByText('Posts').closest('a');
    expect(postsLink).toHaveAttribute('href', '/admin/posts');
  });

  it('highlights the active link based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin/posts');
    
    render(<Sidebar />);
    
    const postsLink = screen.getByText('Posts').closest('a');
    expect(postsLink).toHaveClass('bg-teal-900/30');
    expect(postsLink).toHaveClass('text-teal-400');
  });
});

