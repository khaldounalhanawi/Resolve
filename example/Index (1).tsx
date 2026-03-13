import { useState } from "react";
import WelcomeHeader from "@/components/WelcomeHeader";
import CategorySlider from "@/components/CategorySlider";
import AddCategoryButton from "@/components/AddCategoryButton";

interface Category {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
}

const initialCategories: Category[] = [
  { id: "1", name: "Health & Fitness", value: 60, min: 0, max: 100 },
  { id: "2", name: "Productivity", value: 45, min: 0, max: 100 },
  { id: "3", name: "Finance", value: 30, min: 0, max: 100 },
  { id: "4", name: "Social", value: 75, min: 0, max: 100 },
];

const Index = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const handleSliderChange = (id: string, value: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value } : c))
    );
  };

  const handleAddCategory = () => {
    const newId = String(Date.now());
    setCategories((prev) => [
      ...prev,
      { id: newId, name: `Category ${prev.length + 1}`, value: 50, min: 0, max: 100 },
    ]);
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <WelcomeHeader />

      <div className="px-5 pb-8">
        <h2 className="font-display font-semibold text-navy text-lg mb-4">Categories</h2>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <CategorySlider
              key={cat.id}
              name={cat.name}
              value={cat.value}
              min={cat.min}
              max={cat.max}
              onChange={(v) => handleSliderChange(cat.id, v)}
            />
          ))}
          <AddCategoryButton onClick={handleAddCategory} />
        </div>
      </div>
    </div>
  );
};

export default Index;
