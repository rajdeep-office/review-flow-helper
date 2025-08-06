import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export interface FilterState {
  search: string;
  priority: string[];
  status: string[];
  author: string[];
  hasConflicts: boolean | null;
  withJira: boolean | null;
}

interface SearchFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  authors: string[];
}

export const SearchFilter = ({ filters, onFiltersChange, authors }: SearchFilterProps) => {
  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'low', label: 'Low', color: 'bg-green-500' }
  ];

  const statusOptions = [
    { value: 'waiting', label: 'Waiting' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'commented', label: 'Commented' },
    { value: 'approved', label: 'Approved' },
    { value: 'merged', label: 'Merged' }
  ];

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      priority: [],
      status: [],
      author: [],
      hasConflicts: null,
      withJira: null
    });
  };

  const hasActiveFilters = filters.search || 
    filters.priority.length > 0 || 
    filters.status.length > 0 || 
    filters.author.length > 0 ||
    filters.hasConflicts !== null ||
    filters.withJira !== null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search PRs by title, description, or branch..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                  {[...filters.priority, ...filters.status, ...filters.author].length + 
                   (filters.hasConflicts !== null ? 1 : 0) + 
                   (filters.withJira !== null ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <div className="space-y-2">
                  {priorityOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${option.value}`}
                        checked={filters.priority.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const newPriority = checked
                            ? [...filters.priority, option.value]
                            : filters.priority.filter(p => p !== option.value);
                          onFiltersChange({ ...filters, priority: newPriority });
                        }}
                      />
                      <label
                        htmlFor={`priority-${option.value}`}
                        className="text-sm flex items-center gap-2"
                      >
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.status.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const newStatus = checked
                            ? [...filters.status, option.value]
                            : filters.status.filter(s => s !== option.value);
                          onFiltersChange({ ...filters, status: newStatus });
                        }}
                      />
                      <label htmlFor={`status-${option.value}`} className="text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Author</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {authors.map((author) => (
                    <div key={author} className="flex items-center space-x-2">
                      <Checkbox
                        id={`author-${author}`}
                        checked={filters.author.includes(author)}
                        onCheckedChange={(checked) => {
                          const newAuthor = checked
                            ? [...filters.author, author]
                            : filters.author.filter(a => a !== author);
                          onFiltersChange({ ...filters, author: newAuthor });
                        }}
                      />
                      <label htmlFor={`author-${author}`} className="text-sm">
                        {author}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">Special</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-conflicts"
                      checked={filters.hasConflicts === true}
                      onCheckedChange={(checked) => {
                        onFiltersChange({ 
                          ...filters, 
                          hasConflicts: checked ? true : null 
                        });
                      }}
                    />
                    <label htmlFor="has-conflicts" className="text-sm">
                      Has conflicts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="with-jira"
                      checked={filters.withJira === true}
                      onCheckedChange={(checked) => {
                        onFiltersChange({ 
                          ...filters, 
                          withJira: checked ? true : null 
                        });
                      }}
                    />
                    <label htmlFor="with-jira" className="text-sm">
                      Linked to Jira
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.priority.map(priority => (
            <Badge key={priority} variant="secondary" className="gap-1">
              Priority: {priority}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({
                  ...filters,
                  priority: filters.priority.filter(p => p !== priority)
                })}
              />
            </Badge>
          ))}
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              Status: {status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({
                  ...filters,
                  status: filters.status.filter(s => s !== status)
                })}
              />
            </Badge>
          ))}
          {filters.author.map(author => (
            <Badge key={author} variant="secondary" className="gap-1">
              Author: {author}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({
                  ...filters,
                  author: filters.author.filter(a => a !== author)
                })}
              />
            </Badge>
          ))}
          {filters.hasConflicts && (
            <Badge variant="destructive" className="gap-1">
              Has conflicts
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, hasConflicts: null })}
              />
            </Badge>
          )}
          {filters.withJira && (
            <Badge variant="secondary" className="gap-1">
              Linked to Jira
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, withJira: null })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};