using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	interface ISupportTwoPhaseRendering
	{
		void RenderSecondPhase(RenderContext context);
	}
}
