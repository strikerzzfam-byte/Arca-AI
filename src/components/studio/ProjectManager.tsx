import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Save, Plus } from 'lucide-react';
import { apiService, Project } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProjectManagerProps {
  onProjectSelect: (project: Project) => void;
  currentProject?: Project;
}

export default function ProjectManager({ onProjectSelect, currentProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await apiService.getProjects();
      setProjects(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const project = await apiService.createProject({
        name: newProjectName,
        files: [
          { name: 'index.html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Project</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>', type: 'html' }
        ],
        generatedCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>New Project</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>'
      });
      
      setProjects([project, ...projects]);
      setNewProjectName('');
      setIsDialogOpen(false);
      onProjectSelect(project);
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const saveCurrentProject = async () => {
    if (!currentProject?._id) return;

    try {
      await apiService.updateProject(currentProject._id, currentProject);
      toast({
        title: 'Success',
        description: 'Project saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save project',
        variant: 'destructive',
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await apiService.deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading projects...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <div className="flex gap-2">
          {currentProject && (
            <Button onClick={saveCurrentProject} size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createProject()}
                />
                <Button onClick={createProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3">
        {projects.map((project) => (
          <Card 
            key={project._id} 
            className={`cursor-pointer transition-colors ${
              currentProject?._id === project._id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onProjectSelect(project)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{project.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project._id!);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              {project.description && (
                <CardDescription className="text-xs">{project.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {project.files.length} files • {new Date(project.updatedAt!).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}