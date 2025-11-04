import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, GitBranch, Lock, Globe } from "lucide-react";
import { getUserRepos } from "@/lib/githubService";
import { toast } from "sonner";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  updated_at: string;
}

interface RepoSelectorProps {
  onSelect: (repo: string) => void;
  selected?: string;
}

export default function RepoSelector({ onSelect, selected }: RepoSelectorProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepos();
  }, []);

  useEffect(() => {
    const filtered = repos.filter(repo =>
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      repo.description?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRepos(filtered);
  }, [repos, search]);

  const loadRepos = async () => {
    try {
      setLoading(true);
      const userRepos = await getUserRepos();
      setRepos(userRepos);
    } catch (error) {
      toast.error("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredRepos.map((repo) => (
          <Button
            key={repo.id}
            variant={selected === repo.full_name ? "default" : "outline"}
            className="w-full h-auto p-3 text-left justify-start"
            onClick={() => onSelect(repo.full_name)}
          >
            <div className="flex items-start gap-3 w-full">
              <GitBranch className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{repo.name}</span>
                  <div className="flex gap-1">
                    {repo.private ? (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    )}
                  </div>
                </div>
                {repo.description && (
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {repo.description}
                  </p>
                )}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No repositories found</p>
        </div>
      )}
    </div>
  );
}