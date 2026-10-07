/**
 * Comprehensive Calculation utilities for TRUEX Takeoff System
 */

export const calculateItemSqFt = (length, height, qty = 1, shape = 'RECTANGLE', type = 'addition', unit = 'SQ_FT') => {
  const l = parseFloat(length) || 0;
  const h = parseFloat(height) || 0;
  const q = parseInt(qty, 10) || 1;

  if (unit === 'LINEAR_FT') {
    const baseLinear = l * q;
    return type === 'subtraction' ? -Math.abs(baseLinear) : Math.abs(baseLinear);
  }

  let baseArea = 0;
  if (shape === 'TRIANGLE') {
    baseArea = (l * h) / 2;
  } else {
    baseArea = l * h;
  }

  const total = baseArea * q;
  return type === 'subtraction' ? -Math.abs(total) : Math.abs(total);
};

export const parseWastePercent = (wasteStr) => {
  if (!wasteStr) return 0;
  const cleaned = wasteStr.toString().replace('%', '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const getCategoryTotals = (categoryData) => {
  if (!categoryData || !categoryData.items) {
    return { grossSqFt: 0, subtractionsSqFt: 0, netSqFt: 0, linearFt: 0, itemCount: 0 };
  }

  let grossSqFt = 0;
  let subtractionsSqFt = 0;
  let linearFt = 0;

  categoryData.items.forEach(item => {
    const unit = item.unit || 'SQ_FT';
    const sqft = item.sqft !== undefined 
      ? item.sqft 
      : calculateItemSqFt(item.length, item.height, item.qty, item.shape, item.type, unit);

    if (unit === 'LINEAR_FT') {
      linearFt += Math.abs(sqft);
    } else {
      if (item.type === 'subtraction') {
        subtractionsSqFt += Math.abs(sqft);
      } else {
        grossSqFt += Math.abs(sqft);
      }
    }
  });

  const netSqFt = Math.max(0, grossSqFt - subtractionsSqFt);

  return {
    grossSqFt,
    subtractionsSqFt,
    netSqFt,
    linearFt,
    itemCount: categoryData.items.length
  };
};

export const getSectionTotals = (project, sectionId, allSections) => {
  if (!project || !project.measurements) {
    return { grossSqFt: 0, subtractionsSqFt: 0, netSqFt: 0, linearFt: 0 };
  }

  const section = allSections.find(s => s.id === sectionId);
  if (!section) return { grossSqFt: 0, subtractionsSqFt: 0, netSqFt: 0, linearFt: 0 };

  let grossSqFt = 0;
  let subtractionsSqFt = 0;
  let linearFt = 0;

  section.categories.forEach(cat => {
    const key = `${sectionId}:${cat.id}`;
    const catData = project.measurements[key];
    const catTotals = getCategoryTotals(catData);
    grossSqFt += catTotals.grossSqFt;
    subtractionsSqFt += catTotals.subtractionsSqFt;
    linearFt += catTotals.linearFt;
  });

  return {
    grossSqFt,
    subtractionsSqFt,
    netSqFt: Math.max(0, grossSqFt - subtractionsSqFt),
    linearFt
  };
};

export const getProjectGrandTotals = (project, allSections) => {
  if (!project || !project.measurements) {
    return { 
      grossSqFt: 0, 
      subtractionsSqFt: 0, 
      netSqFt: 0, 
      adjustedSqFt: 0, 
      linearFt: 0, 
      adjustedLinearFt: 0,
      wastePercent: 0,
      activeAreasCount: 0 
    };
  }

  let grossSqFt = 0;
  let subtractionsSqFt = 0;
  let linearFt = 0;
  let activeAreasCount = 0;

  allSections.forEach(section => {
    section.categories.forEach(cat => {
      const key = `${section.id}:${cat.id}`;
      const catData = project.measurements[key];
      if (catData && catData.items && catData.items.length > 0) {
        activeAreasCount++;
        const catTotals = getCategoryTotals(catData);
        grossSqFt += catTotals.grossSqFt;
        subtractionsSqFt += catTotals.subtractionsSqFt;
        linearFt += catTotals.linearFt;
      }
    });
  });

  const netSqFt = Math.max(0, grossSqFt - subtractionsSqFt);
  const wastePercent = parseWastePercent(project?.settings?.wasteFactor || '0%');
  
  const adjustedSqFt = netSqFt * (1 + wastePercent / 100);
  const adjustedLinearFt = linearFt * (1 + wastePercent / 100);

  return {
    grossSqFt,
    subtractionsSqFt,
    netSqFt,
    adjustedSqFt,
    linearFt,
    adjustedLinearFt,
    wastePercent,
    activeAreasCount
  };
};

export const formatSqFt = (val) => {
  const num = Math.round((parseFloat(val) || 0) * 10) / 10;
  return num.toLocaleString('en-US', { maximumFractionDigits: 1 });
};
